#!/usr/bin/env node

/*
 * Read a xlsx data file and turn it into a array of objects.
 *
 */

var fs = require("fs");
var xlsx = require("xlsx");
var cast = require("./cast");

module.exports = function (path, callback) {
    fs.readFile(path, function (err, xlsxData) {
        if (err) {
            return callback(err);
        }

        // Read the entire xlsx file
        var workbook = xlsx.read(xlsxData);

        // Get the first sheet only
        var sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Get the range of the sheet
        var range = xlsx.utils.decode_range(sheet["!ref"]);
        var table = [];
        var cols = [];

        // Get the column letters
        for (var colNum = range.s.c; colNum <= range.e.c; colNum++) {
            cols[colNum] = xlsx.utils.encode_col(colNum);
        }

        // Go through each row, except the first one (the headers)
        for (var R = range.s.r + 1; R <= range.e.r; R++) {
            var row = {};
            var rowNum = (R + 1).toString();

            // Get every cell of that row
            for (var colNum = range.s.c; colNum <= range.e.c; colNum++) {

                // Adresses
                var cell = cols[colNum] + rowNum;
                var header = cols[colNum] + (range.s.c + 1) ;

                // Do nothing if a header is absent
                if (!sheet[header]) {
                    continue;
                }

                // Add the cell text value to the row and handle empty cells
                row[sheet[header].w] = sheet[cell] ? cast(sheet[cell].w) : "";
            }

            table.push(row);
        }

        return callback(null, table);
    });
};
