#!/usr/bin/env node

/*
 * Read a tsv data file and turn it into an object where keys are
 * the first column cells, called row identifers. Each values is an object
 * containing the row : keys are the headers and values are the cells content.
 *
 */

var fs = require('fs');
var cast = require('./cast');

module.exports = function (path, callback) {
    fs.readFile(path, { encoding: 'utf8' }, function (err, tsvData) {
        if (err) {
            return callback(err);
        }

        var data = {};                       // The returned object

        var rows = tsvData
            .trim()
            .split(/\r\n|\n/g)               // Handle each OS end-of-line
            .map(function (line) {
                return line.split('\t');
            });

        var headers = rows.shift();          // Separate headers from the rest

        rows.forEach(function (row) {
            data[row[0]] = {};

            for (var i = 1, l = row.length; i < l; i++) {
                if (headers[i]) {
                    data[row[0]][headers[i]] = cast(row[i]);
                }
            }
        });

        return callback(null, data);
    });
};
