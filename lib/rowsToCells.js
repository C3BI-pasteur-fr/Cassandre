#!/usr/bin/env node

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
