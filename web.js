var express = require('express');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var multer = require('multer');
var _ = require('underscore');
var cluster = require('cluster');

var getConf = require('./config');
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
                return res.status(200).send(list);
            });
    });

    /* list all the expIds for a given measId of the measurements collection */
    app.get('/api/measurements/:mId/exp/list/', function(req, res, next) {
        Measurement.collection.distinct('expId', {
                'measId': { '$in' : decodeURIComponent(req.params.mId).split(',') }
            },
            function(err, list) {
                if (err) {
                    return res.status(500).send("Error with the database : " + err.message);
                }
                return res.status(200).send(list);
            });
    });

    /* list all the geneIds for a given measId of the measurements collection */
    app.get('/api/measurements/:mId/gene/list/', function(req, res, next) {
        Measurement.collection.distinct('geneId', {
                'measId': { '$in' : decodeURIComponent(req.params.mId).split(',') }
            },
            function(err, list) {
                if (err) {
                    return res.status(500).send("Error with the database : " + err.message);
                }
                return res.status(200).send(list);
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

    /* list all the values in a given measurement filtered by gene(s) and/or experiment(s) */
    app.get('/api/measurements/:mId', function(req, res, next) {
        var filter = {'measId': { '$in' : decodeURIComponent(req.params.mId).split(',') } };

        if(req.query.geneId){
            var geneIds = typeof req.query.geneId == 'string' ? [req.query.geneId] : req.query.geneId;
            filter['geneId'] = {'$in': geneIds};
        }
        if(req.query.expId){
            var expIds = typeof req.query.expId == 'string' ? [req.query.expId] : req.query.expId;
            filter['expId'] = {'$in': expIds};
        }

        Measurement.collection.find(filter).toArray(function(err, list) {
            if (err) {
                return res.status(500).send("Error with the database : " + err.message);
            }
            return res.status(200).send(list);
        });
    });

    // load measurements file
    app.post('/api/measurements', function (req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.send('file ' + req.files.dataFile.name);
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
