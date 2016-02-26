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
