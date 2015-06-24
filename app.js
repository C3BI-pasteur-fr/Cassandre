#!/usr/bin/env node

var express = require("express");
var mongoose = require("mongoose");

var Measurement = require("./measurement").measurement;

// ----- Configuration -------------------------------------------------- //

var app = express();
var port = 8080;
var pid = process.pid;

// ----- Middlewares ---------------------------------------------------- //

// Setting static content directory
app.use(express.static(__dirname + "/public"));

// ----- Routing -------------------------------------------------------- //

mongoose.connect('mongodb://localhost/cassandre');

/* list all the contents of the measurements collection  - extremely slow, should it be removed? */
app.get('/api/measurements/', function(req, res, next) {
  Measurement.find(
    function (err, list) {
      if (err) {
        return res.status(500).send("Error with the database : " + err.message);
      }
      return res.status(200).send(list);
  });
});

/* list all the measIds of the measurements collection */
app.get('/api/measurements/list/', function(req, res, next) {
  Measurement.collection.distinct('measId',
    function (err, list) {
      if (err) {
        return res.status(500).send("Error with the database : " + err.message);
      }
      return res.status(200).send(list);
  });
});

/* list all the expIds for a given measId of the measurements collection */
app.get('/api/measurements/:mId/exp/list/', function(req, res, next) {
  console.log(req.params);
  Measurement.collection.distinct('expId',{'measId':req.params.mId},
    function (err, list) {
      if (err) {
        return res.status(500).send("Error with the database : " + err.message);
      }
      return res.status(200).send(list);
  });
});

/* list all the geneIds for a given measId of the measurements collection */
app.get('/api/measurements/:mId/gene/list/', function(req, res, next) {
  Measurement.collection.distinct('geneId',{'measId':req.params.mId},
    function (err, list) {
      if (err) {
        return res.status(500).send("Error with the database : " + err.message);
      }
      return res.status(200).send(list);
  });
});

/* list all the values for a given experiment in a given measurement */
app.get('/api/measurements/:mId/exp/:expId', function(req, res, next) {
  Measurement.find({
      'measId': req.params.mId,
      'expId': req.params.expId
    },function (err, list) {
      if (err) {
        return res.status(500).send("Error with the database : " + err.message);
      }
      return res.status(200).send(list);
  });
});

/* list all the values for a given gene in a given measurement */
app.get('/api/measurements/:mId/gene/:geneId', function(req, res, next) {
  Measurement.find({
      'measId': req.params.mId,
      'geneId': req.params.geneId
    },function (err, list) {
      if (err) {
        return res.status(500).send("Error with the database : " + err.message);
      }
      return res.status(200).send(list);
  });
});

// ----- Server --------------------------------------------------------- //

app.listen(port);
