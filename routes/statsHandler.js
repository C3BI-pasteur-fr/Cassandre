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

// Get the statistics about the datasets, experiments and genes
module.exports = function (req, res) {

    // Get the collection 
    var data = req.app.locals.data;

    // Aggregation pipeline
    var pipeline = [{
        $group: {
            _id: null,
            datasets: { $addToSet: '$set'},
            exps: { $addToSet: '$exp'},
            genes: { $addToSet: '$gene'}
        }
    }, {
        $project: {
            _id: false,
            datasets: { $size: '$datasets'},
            exps: { $size: '$exps'},
            genes : { $size: '$genes'}
        }
    }];

    // Add another stage before the others to filter unrequested datasets
    if (req.query.datasets) {
        pipeline.unshift({
            $match: {
                set: { $in: [].concat(req.query.datasets) }
            }
        });
    }

    data.aggregate(pipeline, function (err, results) {
        if (err) {
            return res.status(500).send('Error with the database : ' + err.message);
        }

        return res.status(200).send(results[0]);
    });
};
