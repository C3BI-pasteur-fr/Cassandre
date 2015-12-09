var tsvParser = require('../lib/tsvParser');
var xlsxParser = require('../lib/xlsxParser');

var Annotations = mongoose.model('Annotations', mongoose.Schema({}, { strict: false }));

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
