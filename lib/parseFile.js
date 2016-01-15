/*
 * Handle the insertion of data in the database.
 *
 */

var tsvParser = require('./tsvParser');
var xlsxParser = require('./xlsxParser');
var mime = require('./allowedFileTypes');

// Parse the file depending on the MIME type
module.exports = function (file, callback) {
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
