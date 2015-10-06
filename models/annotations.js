var path = require('path');
var mongoose = require('mongoose');
var tsvParser = require('../lib/tsvParser');
var xlsxParser = require('../lib/xlsxParser');

var Annotations = mongoose.model('Annotations', mongoose.Schema({
    "column": String,
    "row": String,
    "value": {}
}));

var insertCells = function(cells, callback) {
    var saveNextItem = function(cells) {
        var item = cells.pop();
        item.value = item.value ? item.value : undefined;
        Annotations.collection.insert({
            "column": item.column,
            "row": item.row,
            "value": item.value
        }, function(err) {
            if (err) callback(err);
            if (cells.length > 0) {
                saveNextItem(cells);
            }
            else {
                callback(null);
            }
        });
    }
    saveNextItem(cells);
};

var loadAnnotFile = function(filePath, fileType, callback) {
    if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        xlsxParser(filePath, function (err, cells) {
            if (err) {
                return callback(err);
            }

            return insertCells(cells, callback);
        });
    }

    else {
        tsvParser(filePath, function (err, cells) {
            if (err) {
                return callback(err);
            }

            return insertCells(cells, callback);
        });
    }
};

module.exports = {
    annotations: Annotations,
    loadAnnotFile: loadAnnotFile
};
