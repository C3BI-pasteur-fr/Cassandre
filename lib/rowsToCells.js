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
 * Take an array of rows (objects) and turn them into cells
 * for insertion in the database.
 *
 */

module.exports = function (rows, setName) {

    var cells = [];
    var genes = Object.keys(rows);
    var exps = Object.keys(rows[genes[0]]);

    genes.forEach(function (gene) {
        exps.forEach(function (exp) {
            cells.push({
                set: setName,
                exp: exp,
                gene: gene,
                value: rows[gene][exp]
            });
        });
    });

    return cells;
}
