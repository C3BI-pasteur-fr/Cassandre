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
            var newName = req.body.name || file.originalname;
            return callback(null, newName);
        }
    });

    var upload = multer({
        storage: storage
        // fileFilter
        // limits
    });

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
    .post(upload.single('dataset'), function (req, res) {
        datasets.insert({
            name: req.file.filename,
            description: req.body.description,
            hidden: false,
            postedDate: new Date()
        }, function (err) {
            if (err) {
                if (err.name === 'MongoError') {
                    return res.status(400).send("A dataset with this name already exists.");
                }

                return res.status(400).send(err.message);
            }

            parseFile(req.file, function (err, rows) {
                if (err) {
                    return res.status(400).send(err.message);
                }

                // Turn every row into cells before insertion
                data.insertMany(rowsToCells(rows, req.file.filename), function (err) {
                    if (err) {
                        return res.status(500).send(err.message);
                    }

                    return res.status(201).send({ name: req.file.filename });
                });
            });
        });
    })

    // Update datasets informations
    .put(function (req, res) {

        // First update the datasets collection
        datasets.update({
            name: decodeURIComponent(req.query.name)
        }, {
            $set: req.body
        }, function (err) {
            if (err) {
                if (err.name === 'MongoError') {
                    return res.status(400).send("A dataset with this name already exists.");
                }

                return res.status(400).send(err.message);
            }

            // Also update the data collection if a dataset name changes
            if (req.body.name) {
                data.update({
                    set: decodeURIComponent(req.query.name)
                }, {
                    $set: { set: req.body.newName }
                }, {
                    multi: true
                }, function (err) {
                    if (err) {
                        return res.status(400).send(err.message);
                    }
                    return res.sendStatus(204);
                });
            }
            else {
                return res.sendStatus(204);
            }
        });
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
            });

            return res.sendStatus(204);
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
    .post(upload.single('annotations'), function (req, res) {
        parseFile(req.file, function (err, rows) {
            if (err) {
                return res.status(400).send(err.message);
            }

            annotations.insertMany(rows, function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }

                return res.status(201).send();
            });
        });
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
