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

var async = require('async');

// ============================================================================

exports.INSERT = function (db, callback) {
    
    // Collection
    var genes = db.collection('genes');
    
    var bulk = genes.initializeOrderedBulkOp();

    var query = {
        forUpdate: {},
        forRemove: {
            datasets: { $size: 0 },
            annotation: {}
        }
    };

    var updates = {
        $set: { annotation: {} }
    };

    bulk.find(query.forUpdate).update(updates);
    bulk.find(query.forRemove).delete();

    bulk.execute(callback);
};

// ============================================================================

exports.DELETE = function (db, callback) {
    
};
