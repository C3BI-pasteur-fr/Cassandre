#!/usr/bin/env node

/*
 * Read a tsv data file and turn it into a array of cells
 * to insert in a Mongo database.
 *
 */

var fs = require("fs");

module.exports = function (path, callback) {
    fs.readFile(path, { encoding: "utf8" }, function (err, tsvData) {
        if (err) {
            return callback(err);
        }

        var cells = [];
        var data = tsvData
            .split(/\r\n|\n/g)                  // Get the lines into an array
            .map(function (element) {
                return element.split("\t");     // Split each line into an array
        })

        var headers = data.shift();             // Separate headers from the rest

        data.forEach(function (row) {
            for (var i = 1; i < row.length; i++) {
                cells.push({
                    column: headers[i],
                    row: row[0],
                    value: row[i]
                });
            }
        });

        return callback(null, cells);
    });
};