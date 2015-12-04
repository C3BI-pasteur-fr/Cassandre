#!/usr/bin/env node

/*
 * Read a tsv data file and turn it into a array of objects.
 *
 */

var fs = require('fs');
var cast = require('./cast');
var cells = require("./rowsTocells");

module.exports = function (path, callback) {
    fs.readFile(path, { encoding: 'utf8' }, function (err, tsvData) {
        if (err) {
            return callback(err);
        }

        var data = tsvData
            .trim()
            .split(/\r\n|\n/g)                      // Get the lines into an array
            .map(function (line, index) {           // Split each line into an array
                return line.split('\t');
            });

        var headers = data.shift();                 // Separate headers from the rest

        data = data.map(function (line) {           // Turn each line into an object
            var row = {};
            for (var i = 0, l = line.length; i < l; i++) {
                row[headers[i]] = cast(line[i]);
            }
            return row;
        });

        return callback(null, data);
    });
};
