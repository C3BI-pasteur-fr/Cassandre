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
 * Service to read and parse a XLSX file.
 * Return the content in JSON, formatted in rows for the display.
 *
 * Since Excel doesn't store any empty cell, we need
 * to go through the whole sheet manually. This way we can cast
 * every value and have a nice display.
 *
 */

angular.module("cassandre").factory("xlsxToJson", ["cast", function xlsxToJsonFactory(cast) {

    return function (fileObject, callback) {
        var reader = new FileReader();

        reader.onload = function (e) {

            // Get the entire excel file
            var workbook = XLSX.read(e.target.result, {
                type: "binary"
            });

            // Get the first sheet only
            var sheet = workbook.Sheets[workbook.SheetNames[0]];

            // Get the range of the sheet
            var range = XLSX.utils.decode_range(sheet["!ref"]);
            var table = [];
            var cols = [];

            // Get the column letters
            for (var colNum = range.s.c; colNum <= range.e.c; colNum++) {
                cols[colNum] = XLSX.utils.encode_col(colNum);
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
                    row[sheet[header].w] = sheet[cell] ? cast(sheet[cell].w.trim()) : "";
                }

                table.push(row);
            }

            return callback(null, table);
        }

        reader.readAsBinaryString(fileObject);
    };
}]);
