/*
 * Copyright (C) 2016 Simon Malesys - Institut Pasteur
 *
 * This file is part of Cassandre
 *
 * Cassandre is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Cassandre is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

var fs = require('fs');
var stream = require('stream');
var parseFile = require('../lib/parseFile');
var rowsToCells = require('../lib/rowsToCells');
var rollback = require('./datasetsRollbacks');

// ============================================================================

// Get the list of datasets
exports.GET = function (req, res) {

    // Get the collection
    var datasets = req.app.locals.datasets;

    datasets
    .find()
    .project({ "_id": 0 })
    .toArray(function (err, list) {
        if (err) {
            return res.status(500).send('Error with the database : ' + err.message);
        }
        return res.status(200).send(list);
    });
};

// ============================================================================

// Insert the data file into the database
exports.POST = [

    // Handle the file
    function (req, res, next) {
        req.app.locals.datasetFileHandler(req, res , function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Create an object to safely pass data between middlewares
    function (req, res, next) {
        req.cassandre = {};
        return next();
    },

    // Read The metadata file if exists
    function (req, res, next) {
        if (!req.files.metadata) {
            return next();
        }

        parseFile(req.files.metadata[0], function (err, metadata) {
            if (err) {
                return next({ status: 400, error: err});
            }

            req.cassandre.metadata = metadata;
            return next();
        });
    },

    //// TODO: Check the compatibility between metadata and dataset //////

    // Insert the dataset information
    function (req, res, next) {

        // Get the collection
        var datasets = req.app.locals.datasets;

        datasets.insertOne({
            'name': req.body.name,
            'description': req.body.description,
            'hidden': false,
            'postedDate': new Date()
        }, function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // SPREADSHEETS --- Read the dataset
    function (req, res, next) {
        if (req.app.locals.acceptedMimeTypes.spreadsheet.indexOf(req.files.dataset[0].mimetype) === -1) {
            return next();
        }

        parseFile(req.files.dataset[0], function (err, dataset) {
            if (err) {
                return next({ status: 400, error: err});
            }

            req.cassandre.dataset = dataset;

            return next();
        });
    },

    // SPREADSHEETS --- Upsert the genes
    function (req, res, next) {
        if (req.app.locals.acceptedMimeTypes.spreadsheet.indexOf(req.files.dataset[0].mimetype) === -1) {
            return next();
        }

        // Get the collection
        var genes = req.app.locals.genes;

        var geneList = Object.keys(req.cassandre.dataset);
        var bulk = genes.initializeUnorderedBulkOp();

        geneList.forEach(function (gene) {
            bulk.find({ ID: gene })
                .upsert()
                .updateOne({
                    $addToSet: { datasets: req.body.name },
                    $setOnInsert: { annotation: {} }
                }
            );
        });

        bulk.execute(function (err) {
            if (err) return next({status: 500, error: err});
            return next();
        });
    },

    // SPREADSHEETS --- Upsert the experiments
    function (req, res, next) {
        if (req.app.locals.acceptedMimeTypes.spreadsheet.indexOf(req.files.dataset[0].mimetype) === -1) {
            return next();
        }

        // Get the collection
        var experiments = req.app.locals.experiments;

        var firstID = Object.keys(req.cassandre.dataset)[0];
        var expList = Object.keys(req.cassandre.dataset[firstID]);
        var bulk = experiments.initializeUnorderedBulkOp();

        expList.forEach(function (exp) {
            var meta = req.cassandre.metadata ? (req.cassandre.metadata[exp] || {}) : {};
            var updates = {
                $addToSet: { datasets: req.body.name },
                $set: {}
            };

            updates.$set['metadata.' + req.body.name] = meta;

            bulk.find({ ID: exp })
                .upsert()
                .updateOne(updates);
        });

        bulk.execute(function (err) {
            if (err) return next({status: 500, error: err});
            return next();
        });
    },

    // SPREADSHEETS --- Insert the dataset, turn every row into cells before insertion
    function (req, res, next) {
        if (req.app.locals.acceptedMimeTypes.spreadsheet.indexOf(req.files.dataset[0].mimetype) === -1) {
            return next();
        }

        // Get the collection
        var data = req.app.locals.data;

        var rows = req.cassandre.dataset
        var setName = req.body.name;

        data.insertMany(rowsToCells(rows, setName), {
            ordered: false
        }, function (err) {
            if (err) return next({status: 500, error: err});
            res.status(201).send({ name: req.body.name });
            return next();
        });
    },

    // TEXT FILES --- Insert the data with streams
    function (req, res, next) {
        if (req.app.locals.acceptedMimeTypes.text.indexOf(req.files.dataset[0].mimetype) === -1) {
            return next();
        }

        var datasetName = req.body.name;

        // Database collections
        var experiments = req.app.locals.experiments;
        var genes = req.app.locals.genes;
        var data = req.app.locals.data;

        // Bulk operations for each collection
        var expBulk = experiments.initializeUnorderedBulkOp();
        var geneBulk = genes.initializeUnorderedBulkOp();
        var dataBulk = data.initializeUnorderedBulkOp();

        // The headers list
        var expList = [];

        // Counter to execute the bulks for each specified amount of cells
        var cellsCounter = 0;

        // Stream to read the file
        var fileStream = fs.createReadStream(req.files.dataset[0].path);

        // Stream to split files line by line
        var buffer = '';
        var lineStream = new stream.Transform({
            transform: function (chunk, encoding, nextChunk) {
                var stream = this;

                // Store the piece of file
                buffer += chunk.toString();

                // Get the lines from the piece
                var lines = buffer.split(/\r\n|\n/g);

                // Extract the last unfinished line
                buffer = lines.pop();

                // Send each line to the next stream
                lines.forEach(function (line) {
                    stream.push(line);
                });

                nextChunk();
            }
        });

        // Stream to insert each line in the database
        var firstLine = true;
        var insertStream = new stream.Writable({
            write: function (line, encoding, nextLine) {

                // Handle the headers
                if (firstLine) {

                    expList = line.toString().trim().split('\t');
                    expList.shift();

                    expList.forEach(function (exp) {
                        var metadata = req.cassandre.metadata ? (req.cassandre.metadata[exp] || {}) : {};
                        var upserts = {
                            $addToSet: { datasets: datasetName },
                            $set: {}
                        };

                        upserts.$set['metadata.' + datasetName] = metadata;

                        expBulk.find({ ID: exp })
                            .upsert()
                            .updateOne(upserts);
                    });

                    expBulk.execute(function (err) {
                        if (err) return nextLine(err);
                        firstLine = false;
                        return nextLine();
                    });
                }

                // Handle the other lines
                else {
                    var values = line.toString().trim().split('\t');
                    var gene = values.shift();

                    // First upsert the gene, adding it to the bulk
                    geneBulk.find({ ID: gene })
                        .upsert()
                        .updateOne({
                            $addToSet: { datasets: datasetName },
                            $setOnInsert: { annotation: {} }
                        });

                    // Then insert all the values, adding them to the bulk
                    values.forEach(function (value, index) {
                        cellsCounter++;
                        dataBulk.insert({
                            set: datasetName,
                            exp: expList[index],
                            gene: gene,
                            value : value
                        });
                    });

                    // Insert the for each specified amount of cells
                    if (cellsCounter >= 50000) {
                        geneBulk.execute(function (err) {
                            if (err) return nextLine(err);

                            dataBulk.execute(function (err) {
                                if (err) return nextLine(err);

                                // Reinitialize
                                geneBulk = genes.initializeUnorderedBulkOp();
                                dataBulk = data.initializeUnorderedBulkOp();
                                cellsCounter = 0;

                                return nextLine();
                            });
                        });
                    }
                    else {
                        return nextLine();
                    }
                }
            }
        });

        // Handling stream errors
        fileStream.on('error', function (err) {
            return next(err);
        });

        lineStream.on('error', function (err) {
            return next(err);
        });

        insertStream.on('error', function (err) {
            return next(err);
        });

        // Insert the last remaining data and go on
        insertStream.on('finish', function () {
            if (cellsCounter > 0) {
                geneBulk.execute(function (err) {
                    if (err) return next(err);

                    dataBulk.execute(function (err) {
                        if (err) return next(err);
                        res.status(201).send({ name: req.body.name });
                        return next();
                    });
                });
            }
        });

        // Chain and start the streams
        fileStream.pipe(lineStream).pipe(insertStream);
    },

    // Error handler
    function (err, req, res, next) {
        console.log(err);

        // No Rollback in this case
        if (err.code === 11000) {
            res.status(400).send("A dataset with this name already exists.");
            return next();
        }

        if (err.status && err.error) {
            res.status(err.status).send(err.error.message);
        }
        else {
            res.status(500).send(err.message);
        }

        rollback.INSERT(req.app.locals.db, req.body.name, function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Remove the files from the system, errors or not
    function (req, res, next) {
        fs.unlinkSync(req.files.dataset[0].path);

        if (req.files.metadata) {
            fs.unlinkSync(req.files.metadata[0].path);
        }
    }
];

// ============================================================================

// Update datasets informations in the whole database
exports.PUT = [

    // Update the datasets collection
    function (req, res, next) {

        // Get the collection
        var datasets = req.app.locals.datasets;

        var oldName = decodeURIComponent(req.query.name);
        var query = { name: oldName };
        var updates = { $set: {} };

        if (req.body.name) {
            updates.$set.name = req.body.name;
        }

        if (req.body.description) {
            updates.$set.description = req.body.description;
        }

        if (typeof(req.body.hidden) === 'boolean') {
            updates.$set.hidden = req.body.hidden;
        }

        datasets.updateOne(query, updates, function (err) {
            if (err) next(err);

            if (req.body.name && oldName !== req.body.name) {
                return next();
            }

            return res.sendStatus(204);
        });
    },

    // If needed, update the genes collection
    function (req, res, next) {

        // Get the collection
        var genes = req.app.locals.genes;
        var oldName = decodeURIComponent(req.query.name);

        var query = { datasets: oldName };
        var updates = { $set: { "datasets.$": req.body.name } };

        genes.updateMany(query, updates, function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Then the experiments collection
    function (req, res, next) {

        // Get the collection
        var experiments = req.app.locals.experiments;
        var oldName = decodeURIComponent(req.query.name);

        var query = { datasets: oldName };
        var updates = { $set: { "datasets.$": req.body.name } };

        updates.$rename = {};
        updates.$rename["metadata." + oldName] = "metadata." + req.body.name;

        experiments.updateMany(query, updates, function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // And finally the data collection
    function (req, res, next) {

        // Get the collection
        var data = req.app.locals.data;
        var oldName = decodeURIComponent(req.query.name);

        var query = { set: oldName };
        var updates = { $set: { set: req.body.name } };

        data.updateMany(query, updates, function (err) {
            if (err) return next(err);
            return res.sendStatus(204);
        });
    },

    // Error handler
    function (err, req, res, next) {
        console.log(err);

        // No Rollback in this case
        if (err.code === 11000) {
            res.status(400).send("A dataset with this name already exists.");
            return next();
        }

        if (err.status && err.error) {
            res.status(err.status).send(err.error.message);
        }
        else {
            res.status(500).send(err.message);
        }

        var newName = req.body.name;
        var oldName = decodeURIComponent(req.query.name);

        rollback.UPDATE(req.app.locals.db, newName, oldName, function (err) {
            if (err) return next(err);
            return next();
        });
    }
];

// ============================================================================

// Remove the dataset from the whole database
exports.DELETE = [

    // Remove the given dataset from the database
    function (req, res, next) {

        // Get the collection
        var datasets = req.app.locals.datasets;
        var setName = decodeURIComponent(req.query.name);

        datasets.deleteOne({ name: setName }, function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Remove the dataset in the genes collection.
    // Also remove the genes that no longer appear
    // in any dataset and have no annotation.
    function (req, res, next) {

        // Get the collection
        var genes = req.app.locals.genes;
        var setName = decodeURIComponent(req.query.name);

        var bulk = genes.initializeOrderedBulkOp();

        var query = {
            forUpdate: { datasets: setName },
            forRemove: {
                datasets: { $size: 0 },
                annotation: {}
            }
        };

        var updates = {
            $pull: { datasets: setName }
        };

        bulk.find(query.forUpdate).update(updates);
        bulk.find(query.forRemove).delete();

        bulk.execute(function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Remove the dataset in the experiments collection.
    // Also remove the genes that no longer appear
    // in any dataset.
    function (req, res, next) {

        // Get the collection
        var experiments = req.app.locals.experiments;

        var setName = decodeURIComponent(req.query.name);
        var bulk = experiments.initializeOrderedBulkOp();

        var query = {
            forUpdate: { datasets: setName },
            forRemove: {
                datasets: { $size: 0 }
            }
        };

        var updates = {
            $pull: { datasets: setName },
            $unset: { metadata: {} }
        };

        updates.$unset.metadata[setName] = "";

        bulk.find(query.forUpdate).update(updates);
        bulk.find(query.forRemove).delete();

        bulk.execute(function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Remove all the data corresponding to the dataset
    function (req, res, next) {

        // Get the collection
        var data = req.app.locals.data;

        var setName = decodeURIComponent(req.query.name);

        data.deleteMany({ set: setName }, function (err) {
            if (err) return next(err);
            return res.sendStatus(204);
        });
    },

    // Error handler
    function (err, req, res, next) {
        console.log(err);

        if (err.status && err.error) {
            res.status(err.status).send(err.error.message);
        }
        else {
            res.status(500).send(err.message);
        }
    }
];
