var mongoose = require('mongoose');
var _ = require('underscore');
var exports = {};
var tsvParser = require('./tsvParser');

var MeasurementSchema = mongoose.Schema({
      "measId": String,
      "expId": String,
      "geneId": String,
      "value": Number
      });

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

var loadMeasFile = function(path, env, callback) {
            tsvParser(path, function(err, list) {
                var saveNextItem = function(list) {
                    var item = list.pop();
                    item.value = item.value ? item.value : undefined;
                    Measurement.collection.insert({
                        "measId": path,
                        "expId": item.column,
                        "geneId": item.row,
                        "value": item.value
                    }, function(err, newMeasurement) {
                        if (err) console.error(err, item);
                        if (list.length > 0) {
                            saveNextItem(list);
                        } else {
                            if(callback){
                                callback();
                            }
                        }
                    });
                }
                saveNextItem(list);
            });
        }

module.exports = {measurement: Measurement,
                  measurementExp: MeasurementExp,
                  measurementGene: MeasurementGene,
                  loadMeasFile: loadMeasFile};
