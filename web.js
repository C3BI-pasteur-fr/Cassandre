var express = require('express');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var multer = require('multer');

var _ = require('underscore');
var cluster = require('cluster');
var Measurement = require("./measurement").measurement;
var loadMeasFile = require('./measurement').loadMeasFile;


var router = function(app) {

    app.get('/api/measurements/', function(req, res, next) {
        Measurement.collection.find().toArray(
            function(err, list) {
                if (err) {
                    return res.status(500).send("Error with the database : " + err.message);
                }
                return res.status(200).send(list);
            });
    });

    /* list all the measIds of the measurements collection */
    app.get('/api/measurements/list/', function(req, res, next) {
        Measurement.collection.distinct('measId',
            function(err, list) {
                if (err) {
                    return res.status(500).send("Error with the database : " + err.message);
                }
                return res.status(200).send(list.map(function(measID) {
                    return {
                        "measID": measID
                    }
                }));
            });
    });

    /* list all the expIds for a given measId of the measurements collection */
    app.get('/api/measurements/:mId/exp/list/', function(req, res, next) {
        Measurement.collection.distinct('expId', {
                'measId': req.params.mId
            },
            function(err, list) {
                if (err) {
                    return res.status(500).send("Error with the database : " + err.message);
                }
                return res.status(200).send(list.map(function(expID) {
                    return {
                        "expID": expID
                    }
                }));
            });
    });

    /* list all the geneIds for a given measId of the measurements collection */
    app.get('/api/measurements/:mId/gene/list/', function(req, res, next) {
        Measurement.collection.distinct('geneId', {
                'measId': req.params.mId
            },
            function(err, list) {
                if (err) {
                    return res.status(500).send("Error with the database : " + err.message);
                }
                return res.status(200).send(list.map(function(geneID) {
                    return {
                        "geneID": geneID
                    }
                }));
            });
    });

    /* list all the values for a given experiment in a given measurement */
    app.get('/api/measurements/:mId/exp/:expId', function(req, res, next) {
        Measurement.collection.find({
            'measId': req.params.mId,
            'expId': req.params.expId
        }).toArray(function(err, list) {
            if (err) {
                return res.status(500).send("Error with the database : " + err.message);
            }
            return res.status(200).send(list);
        });
    });

    /* list all the values for a given gene in a given measurement */
    app.get('/api/measurements/:mId/gene/:geneId', function(req, res, next) {
        Measurement.collection.find({
            'measId': req.params.mId,
            'geneId': req.params.geneId
        }).toArray(function(err, list) {
            if (err) {
                return res.status(500).send("Error with the database : " + err.message);
            }
            return res.status(200).send(list);
        });
    });

    // accept PUT request at /user
    app.post('/api/measurements', function (req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.send({'message': 'file ' + req.files.dataFile.name});
      loadMeasFile(req.files.dataFile.path);
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
    server = app.listen(8080);
    router(app);
    console.log('Server listening at port 8080');
};

var launch = function() {
    WebServer();
};

module.exports = launch;
