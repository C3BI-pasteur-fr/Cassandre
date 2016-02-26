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
 * Service to read and parse a TSV file.
 * Return the content in JSON, formatted in rows for the display.
 *
 */

angular.module("cassandre").factory("tsvToJson", ["cast", function tsvToJsonFactory(cast) {

    return function (fileObject, callback) {
        var reader = new FileReader();
        var rows = [];

        reader.onload = function (e) {
            var arrays = e.target.result
                .trim()
                .split(/\r\n|\n/g)              // Handle each OS end-of-lines
                .map(function (line) {          // Split each line into an array
                    return line.split("\t");
                });

            // Separate headers form the rest
            var headers = arrays.shift();

            // Build the JSON
            arrays.forEach(function (array) {
                var row = {};

                array.forEach(function (element, index) {
                    if (headers[index]) {
                        row[headers[index]] = cast(element);
                    }
                });

                rows.push(row);
            });

            return callback(null, rows);
        };

        reader.readAsText(fileObject);
    }
}]);
