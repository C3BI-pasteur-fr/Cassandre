/*
 * Handle the insertion of data in the database.
 *
 */

var tsvParser = require('./tsvParser');
var xlsxParser = require('./xlsxParser');
var rowsToCells = require('./rowsToCells');
var mime = require('./allowedFileTypes');

// Parse the file depending on the MIME type
var parseFile = function (file, callback) {
    if (mime.excel.indexOf (file.mimetype) > -1) {
        xlsxParser(file.path, function (err, rows) {
            if (err) {
                return callback(err);
            }

            return callback(null, rows);
        });
    }
    else {
        tsvParser(file.path, function (err, rows) {
            if (err) {
                return callback(err);
            }
        
            return callback(null, rows);
        });
    }
};

// Store every data element synchronously
var insertData = function (fileName, data, callback) {
    var saveItem = function (data) {
        var item = data.pop();
        item.value = item.value ? item.value : undefined;
        Measurement.collection.insert({
            'measId': fileName,
            'expId': item.column,
            'geneId': item.row,
            'value': item.value
        }, function(err, newMeasurement) {
            if (err) callback(err);
            if (data.length > 0) {
                saveItem(data);
            }
            else {
                callback(null);
            }
        });
    }
    saveItem(data);
};
