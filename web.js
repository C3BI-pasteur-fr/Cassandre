var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var _ = require('underscore');
var ObjectId = require('mongoose').Types.ObjectId;

var getConf = require('./config');
var Measurement = require('./models/measurement').measurement;
var loadFile = require('./models/measurement').loadFile;
var Metadata = require('./models/metadata').metadata;
var loadMetaFile = require('./models/metadata').loadMetaFile;
var Datasets = require('./models/datasets').datasets;

var router = function(app) {

// CONGIGURATION
// =========================================================================

    // Multer middleware to handle file uploads
    var storage = multer.diskStorage({
        destination: './uploads/',
        filename: function (req, file, callback) {
            var newName = req.body.newName || file.originalname;
            return callback(null, newName);
        }
    });

    var upload = multer({
        storage: storage
        // fileFilter
        // limits
    });

// ROUTES
// =========================================================================

    app.route('/api/measurements/')

    // Get the list of datasets
    .get(function (req, res) {
        Datasets.collection.find().toArray(function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }
            return res.status(200).send(list);
        });
    })

    // Insert the measurements file into the database
    .post(upload.single('dataFile'), function (req, res) {
        Datasets.collection.insert({
            name: req.file.filename,
            description: req.body.description,
            hidden: false
        }, function (err) {
            if (err) {
                if (err.name === 'MongoError' && err.code === 11000) {
                    return res.status(400).send("A dataset with this name already exists.");
                }

                return res.status(400).send(err.message);
            }

            loadFile(req.file, function (err) {
                if (err) {
                    return res.status(400).send(err.message);
                }

                return res.sendStatus(201);
            });
        });
    })

    // Update datasets informations
    .put(function (req, res) {
        var settings = { $set: {} };

        // TO CHANGE
        // AND !!!!! REQ.BODY VS REQ.QUERY !!!!
        if (req.query.hidden === 'true') {
            settings.$set.hidden = true;
        }
        
        if (req.query.hidden === 'false') {
            settings.$set.hidden = false;
        }

        if (req.query.newName) {
            settings.$set.name = decodeURIComponent(req.query.newName)
        }

        if (req.query.newDescription) {
            settings.$set.description = decodeURIComponent(req.query.newDescription)
        }

        Datasets.collection.update({
            _id: ObjectId(decodeURIComponent(req.query.id))
        }, settings, function (err, results) {
            if (err) {
                if (err.name === 'MongoError' && err.code === 11001) {
                    return res.status(400).send("A dataset with this name already exists.");
                }

                return res.status(400).send(err.message);
            }

            return res.sendStatus(200);
        });
    });

// =========================================================================

    app.route('/api/metadata/')

    // Get all the metadata
    .get(function(req, res) {
        Metadata.collection.find().toArray(function(err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }
            return res.status(200).send(list);
        });
    })

    // Insert the general metadata file into the database
    .post(upload.single('metaFile'), function (req, res) {
        loadMetaFile(req.file.path, req.file.mimetype, function (err) {
            if (err) {
                console.log(err);
                return res.status(400).send(err.message);
            }
            return res.sendStatus(201);
        });
    });

// =========================================================================

    app.route('/api/measurements/:mId/exp/')

    // List all the columns for given datasets
    .get(function (req, res, next) {
        Measurement.collection.distinct('expId', {
            'measId': {
                '$in' : decodeURIComponent(req.params.mId).split(',')
            }
        },
        function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }
            return res.status(200).send(list);
        });
    });

// =========================================================================

    app.route('/api/measurements/:mId/genes/')

    // List all the lines for given datasets
    .get(function (req, res, next) {
        Measurement.collection.distinct('geneId', {
            'measId': {
                '$in' : decodeURIComponent(req.params.mId).split(',')
            }
        },
        function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }
            return res.status(200).send(list);
        });
    });

// =========================================================================

    app.route('/api/measurements/:mId')

    // Get the values for given datasets, possibly filtered by lines and/or columns
    .get(function (req, res) {
        var filter = {
            'measId': {
                '$in' : decodeURIComponent(req.params.mId).split(',')
            }
        };

        if (req.query.geneId){
            var geneIds = typeof req.query.geneId == 'string' ? [req.query.geneId] : req.query.geneId;
            filter['geneId'] = { '$in': geneIds };
        }

        if (req.query.expId){
            var expIds = typeof req.query.expId == 'string' ? [req.query.expId] : req.query.expId;
            filter['expId'] = { '$in': expIds };
        }

        Measurement.collection.find(filter).toArray(function (err, list) {
            if (err) {
                return res.status(500).send('Error with the database : ' + err.message);
            }
            return res.status(200).send(list);
        });
    })

    // Remove the given datasets from the database
    .delete(function (req, res) {
        var dataset = decodeURIComponent(req.params.mId);

        Measurement.collection.remove({
            'measId': dataset
        }, function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }

            Datasets.collection.remove({
                'name': dataset
            }, function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                return res.sendStatus(200);
            });
        });
    })

    // Add or remove a field "hidden" for a given dataset
    .patch(function (req, res) {
        // DATASETS
        var setting = {};

        if (req.query.hidden === 'true') {
            setting.$set = { 'hidden': true };
        }
        else {
            setting.$unset = { 'hidden': '' };
        }

        Measurement.collection.update({
            'measId': decodeURIComponent(req.params.mId)
        }, setting, {
            'multi': true
        }, function (err, results) {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.sendStatus(200);
        });
    });
};

var WebServer = function(contacts) {
    var app = express();

    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());

    var webPort = getConf('web.port', 8080);
    var webHost = getConf('web.host', 'localhost');

    server = app.listen(webPort, webHost);
    router(app);
    console.log('Server listening to ' + webHost + ':' + webPort);
};

var launch = function() {
    WebServer();
};

module.exports = launch;
