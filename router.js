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

    //var datasetsHandler = upload.single('dataset');

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

    // Upsert the genes information
    function (req, res, next) {

        var geneList = Object.keys(req.cassandre.dataset);
        var bulk = genes.initializeUnorderedBulkOp();

        geneList.forEach(function (gene) {
            bulk.find({ ID: gene })
                .upsert()
                .updateOne({
                    $addToSet: { 'datasets': req.body.name },
                    $setOnInsert: { 'annotation': null }
                }
            );
        });

        bulk.execute(function (err) {
            if (err) return next({status: 500, error: err});
            return next();
        });
    },

    // Upsert the experiments information
    function (req, res, next) {

        var firstID = Object.keys(req.cassandre.dataset)[0];
        var expList = Object.keys(req.cassandre.dataset[firstID]);
        var bulk = experiments.initializeUnorderedBulkOp();

        var settings = {
            $addToSet: {
                datasets: req.body.name
            },
            $set: {}
        };

        expList.forEach(function (exp) {
            var meta = req.cassandre.metadata ? req.cassandre.metadata[exp] : null;
            settings.$set['metadata.' + req.body.name] = meta;

            bulk.find({ ID: exp })
                .upsert()
                .updateOne(settings);
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

    app.route('/api/exp/')

    // List all the experiments (columns) for given datasets
    .get(function (req, res, next) {
        var query = {};

        if (req.query.sets) {
            query.datasets = {
                '$in' : decodeURIComponent(req.query.sets).split(',')
            };
        }

        experiments.find(query).project({ "_id": 0 }).toArray(function (err, list) {
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

        genes.find(query).project({ "_id": 0 }).toArray(function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }

            return res.status(200).send(list);
        });
    });
    
    app.route('/api/genes/annotations')
    
    // Insert the genes annotations file into the database
    .post(annotHandler, function (req, res) {
        parseFile(req.file, function (err, annotations) {
            if (err) {
                return res.status(400).send(err.message);
            }

            var geneList = Object.keys(annotations);
            var bulk = genes.initializeUnorderedBulkOp();
    
            geneList.forEach(function (gene) {
                bulk.find({ ID: gene })
                    .upsert()
                    .updateOne({
                        $set: { 'annotation': annotations[gene] },
                        $setOnInsert: { 'datasets': [] },
                    }
                );
            });

            bulk.execute(function (err) {
                if (err) return res.status(500).send(err.message);
                return res.sendStatus(201);
            });
        });
    })

    // Remove annotations from the database
    .delete(function (req, res) {
        genes.updateMany({}, {
            $set: { 'annotation': null }
        }, function (err) {
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

        data.find(query).toArray(function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }
            return res.status(200).send(list);
        });
    });
};
