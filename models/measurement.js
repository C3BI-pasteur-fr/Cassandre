var tsvParser = require('../lib/tsvParser');
var xlsxParser = require('../lib/xlsxParser');
var mime = require('../lib/allowedFileTypes');

var Measurement = mongoose.model('Measurement', mongoose.Schema({
    'measId': String,
    'expId': String,
    'geneId': String,
    'value': Number
}));

var insertCells = function (fileName, cells, callback) {
    var saveNextItem = function (cells) {
        var item = cells.pop();
        item.value = item.value ? item.value : undefined;
        Measurement.collection.insert({
            'measId': fileName,
            'expId': item.column,
            'geneId': item.row,
            'value': item.value
        }, function(err, newMeasurement) {
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

var loadFile = function(file, callback) {
    if (mime.excel.indexOf(file.mimetype) > -1) {
        xlsxParser(file.path, function (err, cells) {
            if (err) {
                return callback(err);
            }

            return insertCells(file.filename, cells, callback);
        });
    }
    else {
        tsvParser(file.path, function (err, cells) {
            if (err) {
                return callback(err);
            }
        
            return insertCells(file.filename, cells, callback);
        });
    }
};

module.exports = {
    measurement: Measurement,
    loadFile: loadFile
};
