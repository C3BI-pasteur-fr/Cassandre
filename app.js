#!/usr/bin/env node

var express = require("express");
var mongoose = require("mongoose");

var Measurement = require("./measurement").measurement;

// ----- Configuration -------------------------------------------------- //

var app = express();
var port = 8080;
var pid = process.pid;

// ----- Middlewares ---------------------------------------------------- //

app.use(express.static(__dirname + "/public"));             // Setting static content directory

// ----- Routing -------------------------------------------------------- //

mongoose.connect('mongodb://localhost/cassandre');

/* list all the contents of the measurements collection  - extremely slow, should it be removed? */
app.get('/api/measurements/', function(req, res, next) {
  Measurement.find(
    function (err, list) {
      if (err) throw err;
      res.json(list);
  });
});

/* list all the values for a given experiment in a given measurement */
app.get('/api/measurements/:mId/exp/:expId', function(req, res, next) {
  Measurement.find({
      'measId': req.params.mId,
      'expId': req.params.expId
    },function (err, list) {
      if (err) throw err;
      res.json(list);
  });
});

/* list all the values for a given gene in a given measurement */
app.get('/api/measurements/:mId/gene/:geneId', function(req, res, next) {
  Measurement.find({
      'measId': req.params.mId,
      'geneId': req.params.geneId
    },function (err, list) {
      if (err) throw err;
      res.json(list);
  });
});



// ----- Server --------------------------------------------------------- //

app.listen(port);
