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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var parseFile = require('./lib/parseFile');
var rowsToCells = require('./lib/rowsToCells');

module.exports = function (app, db) {

// CONGIGURATION
// =========================================================================

    // Multer middleware to handle file uploads
    var storage = multer.diskStorage({
        destination: './uploads/',
        filename: function (req, file, callback) {
            return callback(null, file.originalname + '-' + (new Date()).toISOString());
        }
    });

    var upload = multer({
        storage: storage
        // fileFilter
        // limits
    });

    var datasetsHandler = upload.fields([
        { name: 'dataset', maxCount: 1 },
        { name: 'metadata', maxCount: 1 }
    ]);

    var annotHandler = upload.single('annotations');

    // Database collections
    var datasets = db.collection('datasets');
    var experiments = db.collection('experiments');
    var genes = db.collection('genes');
    var data = db.collection('data');

// ROUTES
// =========================================================================

    app.route('/api/stats')

    // Get the numbers of datasets, experiments and genes in the database
    .get(function (req, res) {

        // Aggregation pipeline
        var pipeline = [{
            $group: {
                _id: null,
                datasets: { $addToSet: '$set'},
                exps: { $addToSet: '$exp'},
                genes: { $addToSet: '$gene'}
            }
        }, {
            $project: {
                _id: false,
                datasets: { $size: '$datasets'},
                exps: { $size: '$exps'},
                genes : { $size: '$genes'}
            }
        }];

        // Add another stage before the others to filter unrequested datasets
        if (req.query.datasets) {
            pipeline.unshift({
                $match: {
                    set: { $in: [].concat(req.query.datasets) }
                }
            });
        }

        data.aggregate(pipeline, function (err, results) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }

            return res.status(200).send(results[0]);
        });
    })

// =========================================================================

    app.route('/api/datasets')

    // Get the list of datasets
    .get(function (req, res) {
        datasets.find().toArray(function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }
            return res.status(200).send(list);
        });
    })

    // Insert the data file into the database
    .post(datasetsHandler, function (req, res, next) {
        req.cassandre = {};     // Object to pass data between middlewares
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

    // Read the dataset
    function (req, res, next) {
        parseFile(req.files.dataset[0], function (err, dataset) {
            if (err) {
                return next({ status: 400, error: err});
            }

            req.cassandre.dataset = dataset;

            return next();
        });
    },

    //// Check the compatibility between metadata and dataset //////

    // Insert the dataset information
    function (req, res, next) {
        datasets.insertOne({
            'name': req.body.name,
            'description': req.body.description,
            'hidden': false,
            'postedDate': new Date()
        }, function (err) {
            if (err) {
                if (err.code === 11000) {
                    err.message = "A dataset with this name already exists.";
                    return next({status: 400, error: err});
                }
                return next({status: 500, error: err});
            }

            next();
        });
    },

    // Upsert the genes
    function (req, res, next) {

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

    // Upsert the experiments
    function (req, res, next) {

        var firstID = Object.keys(req.cassandre.dataset)[0];
        var expList = Object.keys(req.cassandre.dataset[firstID]);
        var bulk = experiments.initializeUnorderedBulkOp();

        expList.forEach(function (exp) {
            var meta = req.cassandre.metadata ? req.cassandre.metadata[exp] : null;
            var updates = {
                $addToSet: {
                    datasets: req.body.name
                },
                $set: {
                    metadata: {}
                }
            };

            updates.$set.metadata[req.body.name] = meta;

            bulk.find({ ID: exp })
                .upsert()
                .updateOne(updates);
        });

        bulk.execute(function (err) {
            if (err) return next({status: 500, error: err});
            return next();
        });
    },

    // Insert the dataset, turn every row into cells before insertion
    function (req, res, next) {
        var rows = req.cassandre.dataset
        var setName = req.body.name;

        data.insertMany(rowsToCells(rows, setName), function (err) {
            if (err) return next({status: 500, error: err});
            res.status(201).send({ name: req.body.name });
            return next();
        });
    },

    // Error handler
    function (err, req, res, next) {
        if (err.status && err.error) {
            res.status(err.status).send(err.error.message);
        }
        else {
            res.status(500).send(err.message);
        }

        console.log(err);
        next();
    },

    // Remove the files from the system, errors or not
    function (req, res, next) {
        fs.unlinkSync(req.files.dataset[0].path);

        if (req.files.metadata) {
            fs.unlinkSync(req.files.metadata[0].path);
        }
    })

    // Update datasets informations
    .put(function (req, res, next) {

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

        datasets.update(query, updates, function (err) {
            if (err) {
                if (err.code === 11000) {
                    err.message = "A dataset with this name already exists.";
                    return next({status: 400, error: err});
                }
                return next(err);
            }

            if (req.body.name && oldName !== req.body.name) {
                return next();
            }

            return res.sendStatus(204);
        });
    },

    // If needed, update the genes collection
    function (req, res, next) {
        var oldName = decodeURIComponent(req.query.name);

        genes.updateMany({
            datasets: oldName
        }, {
            $set: {
                "datasets.$": req.body.name
            }
        }, function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Then the experiments collection
    function (req, res, next) {
        var oldName = decodeURIComponent(req.query.name);
        var query = { datasets: oldName };
        var updates = {};

        updates.$set = {
            "datasets.$": req.body.name
        };

        updates.$rename = {};
        updates.$rename["metadata." + oldName] = req.body.name;

        experiments.updateMany(query, updates, function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // And finally the data collection
    function (req, res, next) {
        var oldName = decodeURIComponent(req.query.name);

        data.updateMany({
            set: oldName
        }, {
            $set: {
                set: req.body.name
            }
        }, function (err) {
            if (err) return next(err);
            return res.sendStatus(204);
        });
    },

    // Error handler
    function (err, req, res, next) {
        if (err.status && err.error) {
            res.status(err.status).send(err.error.message);
        }
        else {
            res.status(500).send(err.message);
        }
    })

    // Remove the given dataset from the database
    .delete(function (req, res, next) {
        var setName = decodeURIComponent(req.query.name);

        datasets.remove({
            name: setName
        }, function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Remove the dataset in the genes collection.
    // Also remove the genes that no longer appear
    // in any dataset and have no annotation.
    function (req, res, next) {

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
            $pull: {
                datasets: setName
            }
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

        var setName = decodeURIComponent(req.query.name);
        var bulk = experiments.initializeOrderedBulkOp();

        var query = {
            forUpdate: { datasets: setName },
            forRemove: {
                datasets: { $size: 0 }
            }
        };

        var updates = {
            $pull: {
                datasets: setName
            },
            $unset: {
                metadata: {}
            }
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
        var setName = decodeURIComponent(req.query.name);

        data.deleteMany({
            set: setName
        }, function (err) {
            if (err) return next(err);
            return res.sendStatus(204);
        });
    },

    // Error handler
    function (err, req, res, next) {
        if (err.status && err.error) {
            res.status(err.status).send(err.error.message);
        }
        else {
            res.status(500).send(err.message);
        }
    });

// =========================================================================

    app.route('/api/exp/')

    // List all the experiments (columns) for given datasets
    .get(function (req, res, next) {
        var query = {};

        if (req.query.sets) {
            query.datasets = {
                '$in' : decodeURIComponent(req.query.sets).split(',')
            };
        }

        experiments
        .find(query)
        .project({ "_id": 0 })
        .sort({ "ID": 1 })
        .toArray(function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }

            return res.status(200).send(list);
        });
    });

// =========================================================================

    app.route('/api/genes/')

    // List all the genes (lines) for given datasets
    .get(function (req, res, next) {
        var query = {};

        if (req.query.sets) {
            query.datasets = {
                '$in' : decodeURIComponent(req.query.sets).split(',')
            };
        }

        genes
        .find(query)
        .project({ "_id": 0 })
        .sort({ "ID": 1 })
        .toArray(function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }

            return res.status(200).send(list);
        });
    });

// =========================================================================

    app.route('/api/genes/annotations')

    // Insert the genes annotations file into the database
    .post(annotHandler, function (req, res, next) {
        parseFile(req.file, function (err, annotations) {
            if (err) {
                return next({ status: 400, message: err.message})
            }

            var geneList = Object.keys(annotations);
            var bulk = genes.initializeUnorderedBulkOp();

            geneList.forEach(function (gene) {
                var updates = {};

                for (var field in annotations[gene]) {
                    updates['annotation.' + field] = annotations[gene][field];
                }

                bulk.find({ ID: gene })
                    .upsert()
                    .updateOne({
                        $set: updates,
                        $setOnInsert: { 'datasets': [] },
                    }
                );
            });

            bulk.execute(function (err) {
                if (err) return next({ status: 500, message: err.message});
                res.sendStatus(201);
                return next();
            });
        });
    },

    // Error handler
    function (err, req, res, next) {
        if (err.status) {
            res.status(err.status).send(err.message);
        }
        else {
            res.status(500).send(err.message);
        }

        console.log(err);
        next();
    },

    // Remove the files from the system, errors or not
    function (req, res, next) {
        fs.unlinkSync(req.file.path);
    })

    // Remove the genes annotations from the database.
    // Also remove the genes that no longer appear
    // in any dataset and have no annotation.
    .delete(function (req, res) {

        var bulk = genes.initializeOrderedBulkOp();

        var query = {
            forUpdate: {},
            forRemove: {
                datasets: { $size: 0 },
                annotation: {}
            }
        };

        var updates = {
            $set: {
                annotation: {}
            }
        };

        bulk.find(query.forUpdate).update(updates);
        bulk.find(query.forRemove).delete();

        bulk.execute(function (err) {
            if (err) return res.status(500).send(err.message);
            return res.sendStatus(204);
        });
    });

// =========================================================================

    app.route('/api/data/:sets')

    // Get the values for given datasets, possibly filtered by lines and/or columns
    .get(function (req, res) {
        var query = {
            'set': {
                '$in' : decodeURIComponent(req.params.sets).split(',')
            }
        };

        if (req.query.genes){
            var genes = typeof req.query.genes == 'string' ? [req.query.genes] : req.query.genes;
            query['gene'] = { '$in': genes };
        }

        if (req.query.exps){
            var exps = typeof req.query.exps == 'string' ? [req.query.exps] : req.query.exps;
            query['exp'] = { '$in': exps };
        }

        data
        .find(query)
        .sort({ "gene": 1 })
        .toArray(function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }
            return res.status(200).send(list);
        });
    });
};
