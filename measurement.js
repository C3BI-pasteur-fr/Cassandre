var path = require('path');
var mongoose = require('mongoose');
var _ = require('underscore');
var exports = {};
var tsvParser = require('./tsvParser');
var xlsxParser = require('./xlsxParser');

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
    "values": [Number]
});

var MeasurementExp = mongoose.model('MeasurementExp', MeasurementExpSchema);

var MeasurementGeneSchema = mongoose.Schema({
    "measId": String,
    "geneId": String,
    "values": [Number]
});

var MeasurementGene = mongoose.model('MeasurementGene', MeasurementGeneSchema);

var insertCells = function(fileName, cells, callback) {
    var saveNextItem = function(cells) {
        var item = cells.pop();
        item.value = item.value ? item.value : undefined;
        Measurement.collection.insert({
            "measId": fileName,
            "expId": item.column,
            "geneId": item.row,
            "value": item.value
        }, function(err, newMeasurement) {
            if (err) callback(err);
            if (cells.length > 0) {
                saveNextItem(cells);
            } else {
                callback(null);
            }
        });
    }
    saveNextItem(cells);
};

var loadMeasFile = function(filePath, fileType, callback) {
    var fileName = path.basename(filePath, path.extname(filePath));
    
    if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        xlsxParser(filePath, function (err, cells) {
            if (err) {
                return callback(err);
            }
            
            return insertCells(fileName, cells, callback);
        });
    }
    else {
        tsvParser(filePath, function (err, cells) {
            if (err) {
                return callback(err);
            }
        
            return insertCells(fileName, cells, callback);
        });
    }
};

module.exports = {
    measurement: Measurement,
    measurementExp: MeasurementExp,
    measurementGene: MeasurementGene,
    loadMeasFile: loadMeasFile
};
