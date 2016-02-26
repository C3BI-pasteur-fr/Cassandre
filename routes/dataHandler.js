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

// Get the values for given datasets, possibly filtered by genes and/or experiments
exports.GET = function (req, res) {

    // Get the collection
    var data = req.app.locals.data;

    var query = {
        'set': {
            '$in' : decodeURIComponent(req.params.sets).split(',')
        }
    };

    if (req.query.genes){
        var genes = typeof req.query.genes == 'string' ? [req.query.genes] : req.query.genes;
        query['gene'] = { '$in': genes };
    }

    if (req.query.exps){
        var exps = typeof req.query.exps == 'string' ? [req.query.exps] : req.query.exps;
        query['exp'] = { '$in': exps };
    }

    data
    .find(query)
    .sort({ "gene": 1 })
    .toArray(function (err, list) {
        if (err) {
            return res.status(500).send('Error with the database : ' + err.message);
        }
        return res.status(200).send(list);
    });
};
