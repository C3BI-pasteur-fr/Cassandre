var mongoose = require('mongoose');
var _ = require('underscore');

var MeasurementSchema = mongoose.Schema({
      "measId": String,
      "expId": String,
      "geneId": String,
      "value": Number});

var Measurement = mongoose.model('Measurement', MeasurementSchema);

module.exports = Measurement;
