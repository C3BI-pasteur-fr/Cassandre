#!/usr/bin/env node

/*
 * Take an array of rows (objects) and turn them into cells
 * for insertion in the database.
 *
 */

module.exports = function (rows, dataset) {
    var cells = [];
    var headers = Object.keys(rows[0]);

    rows.forEach(function (row) {
        for (var i = 1; i < headers.length; i++) {
            cells.push({
                set: dataset,
                exp: headers[i],
                gene: row[headers[0]],
                value: row[headers[i]]
            });
        }
    });

    return cells;
}
