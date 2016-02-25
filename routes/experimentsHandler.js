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

// List all the experiments for the given datasets
exports.GET = function (req, res, next) {

    // Get the collection
    var experiments = req.app.locals.experiments;

    var expList = {};
    var query = {};

    if (req.query.sets) {
        query.datasets = {
            '$in' : decodeURIComponent(req.query.sets).split(',')
        };
    }

    experiments
    .find(query)
    .project({ "_id": 0 })
    .sort({ "ID": 1 })
    .forEach(function (exp) {

        // Put all the experiments into a single object
        expList[exp.ID] = {
            datasets: exp.datasets,
            metadata: exp.metadata
        };

    }, function (err) {
        if (err) {
            return res.status(500).send('Error with the database : ' + err.message);
        }
        return res.status(200).send(expList);
    });
};
