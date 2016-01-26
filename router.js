var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var async = require('async');
var parseFile = require('./lib/parseFile');
var rowsToCells = require('./lib/rowsToCells');

module.exports = function (app, db) {

// CONGIGURATION
// =========================================================================

    // Multer middleware to handle file uploads
    var storage = multer.diskStorage({
        destination: './uploads/',
        filename: function (req, file, callback) {
            console.log(file);
            return callback(null, file.originalname + '-' + Date.now());
        }
    });

    var upload = multer({
        storage: storage
        // fileFilter
        // limits
    });

    //var datasetsHandler = upload.single('dataset');

    var datasetsHandler = upload.fields([
        { name: 'dataset', maxCount: 1},
        { name: 'metadata', maxCount: 1},
    ]);

    var annotHandler = upload.single('annotations');

    // Database collections
    var data = db.collection('data');
    var datasets = db.collection('datasets');
    var annotations = db.collection('annotations');

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
    .post(datasetsHandler, function (req, res) {

        var datafile = req.files.dataset[0];
        var metafile = req.files.metadata ? req.files.metadata[0] : null;

        async.waterfall([

            // Read The metadata file if exists
            function (mainCallback) {
                if (!metafile) {
                    return mainCallback();
                }

                parseFile(metafile, function (err, rows) {
                    if (err) {
                        err.httpCode = 400;
                        return mainCallback(err);
                    }

                    var metadata = {};

                    // Turn the rows into a single object
                    async.each(rows, function (row, callback) {
                        metadata[row.ID] = row;
                        delete metadata[row.ID]['ID'];
                        callback();
                    }, function () {
                        return mainCallback(null, metadata);
                    });
                });
            },

            // Read the dataset
            function (metadata, mainCallback) {
                mainCallback = arguments.length === 2 ? mainCallback : metadata;
                parseFile(datafile, function (err, dataset) {
                    if (err) {
                        err.httpCode = 400;
                        return mainCallback(err);
                    }
                    return mainCallback(null, metadata, dataset);
                });
            },

            // Check the compatibility between metadata and dataset
            function (metadata, dataset, mainCallback) {
                if (!metadata) {
                    return mainCallback(null, null, dataset);
                }

                return mainCallback(null, metadata, dataset);
            },

            // Insert the datasets information and its metadata
            function (metadata, dataset, mainCallback) {
                datasets.insert({
                    name: req.body.name,
                    description: req.body.description,
                    hidden: false,
                    postedDate: new Date(),
                    metadata: metadata
                }, function (err) {
                    if (err) {
                        if (err.name === 'MongoError') {
                            err.httpCode = 400;
                            err.message = "A dataset with this name already exists.";
                            return mainCallback(err);
                        }
                        return mainCallback(err);
                    }
                    return mainCallback(null, dataset);
                });
            },

            // Insert the dataset, turn every row into cells before insertion
            function (dataset, mainCallback) {
                data.insertMany(rowsToCells(dataset, req.body.name), function (err) {
                    if (err) {
                        datasets.deleteOne({ name: req.body.name });
                        err.httpCode = 500;
                        return mainCallback(err);
                    }
                    ////// REMOVE FILE HERE /////////////////////////
                    return mainCallback(null);
                });
            }

        ], function (err, result) {
            if (err) {
                return res.status(err.httpCode).send(err.message);
            }

            return res.status(201).send({ name: req.body.name });
        });
    })

    // Update datasets informations
    .put(function (req, res, next) {
        datasets.update({
            name: decodeURIComponent(req.query.name)
        }, {
            $set: req.body
        }, function (err) {
            if (err) {
                return next(err);
            }

            return next();
        });
    },

    // Also update the data collection if a dataset name changes
    function (req, res, next) {

        if (req.query.name === req.body.name) {
            return res.sendStatus(204);
        }

        data.update({
            set: decodeURIComponent(req.query.name)
        }, {
            $set: { set: req.body.name }
        }, {
            multi: true
        }, function (err) {
            if (err) {
                return next(err);
            }

            return res.sendStatus(204);
        });
    },

    // Error handler
    function (err, req, res, next) {
        if (err.name === 'MongoError') {
            return res.status(400).send("A dataset with this name already exists.");
        }
        
        return res.status(500).send(err.message);
    })

    // Remove the given datasets from the database
    .delete(function (req, res) {
        var dataset = decodeURIComponent(req.query.name);

        datasets.remove({
            name: dataset
        }, function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }

            data.remove({
                set: dataset
            }, function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }

                return res.sendStatus(204);
            });
        });
    });

// =========================================================================

    app.route('/api/annotations/')

    // Get all the annotations
    .get(function(req, res) {
        var list = {};

        annotations.find().project({ _id: false }).each(function (err, annotation) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }

            if (annotation === null) {
                return res.status(200).send(list);
            }

            // Turn all the annotations into a single object
            list[annotation.ID] = annotation;
            delete list[annotation.ID]['ID'];
        });
    })

    // Insert the general annotations file into the database
    .post(annotHandler, function (req, res) {
        parseFile(req.file, function (err, rows) {
            if (err) {
                return res.status(400).send(err.message);
            }

            annotations.insertMany(rows, function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }

                return res.sendStatus(201);
            });
        });
    })

    // Remove annotations from the database
    .delete(function (req, res) {
        annotations.deleteMany({}, function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }

            return res.sendStatus(204);
        })
    });

// =========================================================================

    app.route('/api/data/exp/')

    // List all the experiments (columns) for given datasets
    .get(function (req, res, next) {
        var query = {};

        if (req.query.sets) {
            query.set = {
                '$in' : decodeURIComponent(req.query.sets).split(',')
            };
        }

        data.distinct('exp', query, function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }

            return res.status(200).send(list);
        });
    });

// =========================================================================

    app.route('/api/data/genes/')

    // List all the genes (lines) for given datasets
    .get(function (req, res, next) {
        var query = {};

        if (req.query.sets) {
            query.set = {
                '$in' : decodeURIComponent(req.query.sets).split(',')
            };
        }

        data.distinct('gene', query, function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }

            return res.status(200).send(list);
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

        data.find(query).toArray(function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }
            return res.status(200).send(list);
        });
    });
};
