/*
 * Copyright (C) 2016 Simon Malesys - Institut Pasteur
 *
 * This file is part of Cassandre
 *
 * Cassandre is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Cassandre is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

/*
 * Read a xlsx data file and turn it into an object where keys are
 * the first column cells, called row identifers. Each values is an object
 * containing the row : keys are the headers and values are the cells content.
 *
 * Excel doesn't store any empty cells and the parser of
 * the XLSX module doesn't handle it.
 *
 * For this reason we need to manually go trough the sheet
 * instead of using the built-in functions of the parser to turn
 * the sheet into JSON.
 *
 */

var fs = require("fs");
var xlsx = require("xlsx");
var cast = require("./cast");

module.exports = function parse(path, callback) {
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
        var table = {};
        var colLetters = [];

        // Get the column letters
        for (var colNum = range.s.c; colNum <= range.e.c; colNum++) {
            colLetters.push(xlsx.utils.encode_col(colNum));
        }

        // Get the rows identifiers (the first column)
        for (var rowNum = range.s.r + 2; rowNum <= range.e.r + 1; rowNum++) {
            var IDCell = colLetters[0] + rowNum;
            var ID = sheet[IDCell].w;
            table[ID] = {};

            // Get every cell of that row
            colLetters.forEach(function (colLetter, index) {

                // Do nothing for the IDs column
                if (index === 0) {
                    return;
                }

                // Adresses
                var cell = colLetter + rowNum;
                var headerCell = colLetter + (range.s.c + 1);

                // Do nothing if a header is absent
                if (!sheet[colLetter + (range.s.c + 1)]) {
                    return;
                }

                // Cell contents
                var value = sheet[cell] ? cast(sheet[cell].w) : '';
                var header = sheet[headerCell].w;

                table[ID][header] = value;
            });
        }

        return callback(null, table);
    });
};
