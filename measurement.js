var mongoose = require('mongoose');
var _ = require('underscore');
var exports = {};

var MeasurementSchema = mongoose.Schema({
      "measId": String,
      "expId": String,
      "geneId": String,
      "value": Number
      }, {collection: "Measurement"});

var Measurement = mongoose.model('Measurement', MeasurementSchema);

var MeasurementExpSchema = mongoose.Schema({
      "measId": String,
      "expId": String,
      "values": [Number]});

var MeasurementExp = mongoose.model('MeasurementExp', MeasurementExpSchema);

var MeasurementGeneSchema = mongoose.Schema({
      "measId": String,
      "geneId": String,
      "values": [Number]});

var MeasurementGene = mongoose.model('MeasurementGene', MeasurementGeneSchema);


module.exports = {measurement: Measurement,
                  measurementExp: MeasurementExp,
                  measurementGene: MeasurementGene};
