var express = require('express');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var multer = require('multer');
var _ = require('underscore');
var cluster = require('cluster');

var getConf = require('./config');
var Measurement = require("./measurement").measurement;
var loadFile = require('./measurement').loadFile;
var Metadata = require('./metadata').metadata;
var loadMetaFile = require('./metadata').loadMetaFile;

var router = function(app) {

// ROUTES
// =========================================================================

    app.route('/api/measurements/')

    // Get the list of datasets
    .get(function(req, res) {
        Measurement.collection.aggregate([{
            $group: {
                _id: {
                    measId: "$measId", hidden: "$hidden"
                }
            }
        }],
        function(err, list) {
            if (err) {
                return res.status(500).send("Error with the database : " + err.message);
            }
            return res.status(200).send(list.map(function (set) { return set._id }));
        });
    })

    // Insert the measurements file into the database
    .post(function (req, res) {
        loadFile(req.files.dataFile.path, req.files.dataFile.mimetype, function (err) {
            if (err) {
                return res.status(400).send(err.message);
            }
            return res.sendStatus(201);
        });
    });

// =========================================================================

    app.route('/api/metadata/')

    // Get all the metadata
    .get(function(req, res) {
        Metadata.collection.find().toArray(function(err, list) {
            if (err) {
                return res.status(500).send("Error with the database : " + err.message);
            }
            return res.status(200).send(list);
        });
    })

    // Insert the general metadata file into the database
    .post(function (req, res) {
        loadMetaFile(req.files.metaFile.path, req.files.metaFile.mimetype, function (err) {
            if (err) {
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
                return res.status(500).send("Error with the database : " + err.message);
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
                return res.status(500).send("Error with the database : " + err.message);
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
                return res.status(500).send("Error with the database : " + err.message);
            }
            return res.status(200).send(list);
        });
    })

    // Remove the given datasets from the database
    .delete(function (req, res) {
        Measurement.collection.remove({
            'measId': decodeURIComponent(req.params.mId)
        }, function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.sendStatus(200);
        });
    })

    // Add or remove a field "hidden" for a given dataset
    .patch(function (req, res) {
        var setting = {};

        if (req.query.hidden === 'true') {
            setting.$set = { 'hidden': true };
        }
        else {
            setting.$unset = { 'hidden': "" };
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
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(serveStatic('public', {
        'index': ['index.html']
    }));
    app.use(multer({
        dest: './uploads/',
        rename: function (fieldname, filename) {
            return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
        }
    }));
    var webPort = getConf("web.port",8080);
    var webHost = getConf("web.host", "localhost");
    server = app.listen(webPort, webHost);
    router(app);
    console.log("Server listening to " + webHost + ":" + webPort);
};

var launch = function() {
    WebServer();
};

module.exports = launch;
