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

// Return all the genes for the given datasets
exports.GET = function (req, res, next) {

    // Get the collection
    var genes = req.app.locals.genes;

    var geneList = {};
    var query = {};

    if (req.query.sets) {
        query.datasets = {
            '$in' : decodeURIComponent(req.query.sets).split(',')
        };
    }

    genes
    .find(query)
    .project({ "_id": 0 })
    .sort({ "ID": 1 })
    .forEach(function (gene) {

        // Put all the genes into a single object
        geneList[gene.ID] = {
            datasets: gene.datasets,
            annotation: gene.annotation
        };

    }, function (err) {
        if (err) {
            return res.status(500).send('Error with the database : ' + err.message);
        }
        return res.status(200).send(geneList);
    });
};
