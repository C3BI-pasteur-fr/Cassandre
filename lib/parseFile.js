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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

/*
 * Handle the insertion of data in the database.
 *
 */

var tsvParser = require('./tsvParser');
var xlsxParser = require('./xlsxParser');
var mime = require('./allowedFileTypes');

// Parse the file depending on the MIME type
module.exports = function (file, callback) {
    if (mime.excel.indexOf (file.mimetype) > -1) {
        xlsxParser(file.path, function (err, rows) {
            if (err) {
                return callback(err);
            }

            return callback(null, rows);
        });
    }
    else {
        tsvParser(file.path, function (err, rows) {
            if (err) {
                return callback(err);
            }

            return callback(null, rows);
        });
    }
};
