#!/usr/bin/env node

/*
 * Read a xlsx data file and turn it into a array of cells
 * to insert in a Mongo database.
 *
 */

var fs = require("fs");
var xlsx = require("xlsx");

module.exports = function (path, callback) {
    fs.readFile(path, function (err, xlsxData) {
        if (err) {
            return callback(err);
        }
        
        var cells = [];

        // Read the entire xlsx file
        var workbook = xlsx.read(xlsxData);

        // JSONify only the first sheet
        var rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        // Get the headers
        var headers = Object.keys(rows[0]);

        rows.forEach(function (row) {
            for (var i = 1; i < headers.length; i++) {
                cells.push({
                    column: headers[i],
                    row: row[headers[0]],
                    value: row[headers[i]]
                });
            }
        });

        return callback(null, cells);
    });
};

//parse("/home/simon/Projects-Repositories/cassandre/example_data/analyses.xlsx", function (err, json) {
//    if (err) {
//        console.log("Error : \n" + err);
//    }
//
//    console.log(json);
//});
