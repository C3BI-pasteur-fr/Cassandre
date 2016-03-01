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

exports.INSERT = function (db, datasetName, callback) {

    // Collections
    var datasets = db.collection('datasets');
    var experiments = db.collection('experiments');
    var genes = db.collection('genes');
    var data = db.collection('data');

    async.series([

        function (callback) {
            datasets.remove({ name: datasetName }, callback);
        },

        function (callback) {
            var bulk = genes.initializeOrderedBulkOp();

            var query = {
                forUpdate: { datasets: datasetName },
                forRemove: {
                    datasets: { $size: 0 },
                    annotation: {}
                }
            };

            var updates = {
                $pull: { datasets: datasetName }
            };

            bulk.find(query.forUpdate).update(updates);
            bulk.find(query.forRemove).delete();

            bulk.execute(callback);
        },

        function (callback) {
            var bulk = experiments.initializeOrderedBulkOp();

            var query = {
                forUpdate: { datasets: datasetName },
                forRemove: {
                    datasets: { $size: 0 }
                }
            };

            var updates = {
                $pull: { datasets: datasetName },
                $unset: { metadata: {} }
            };

            updates.$unset.metadata[datasetName] = "";

            bulk.find(query.forUpdate).update(updates);
            bulk.find(query.forRemove).delete();

            bulk.execute(callback);
        },

        function (callback) {
            data.deleteMany({ set: datasetName }, callback);
        }
    ],

    function (err, results) {
        if (err) return callback();
        return callback();
    });
};

// ============================================================================

exports.UPDATE = function (db, newName, oldName, callback) {

    // Collections
    var datasets = db.collection('datasets');
    var experiments = db.collection('experiments');
    var genes = db.collection('genes');
    var data = db.collection('data');

    async.series([
        
        function (callback) {
            var query = { name: newName };
            var updates = { $set: { name: oldName } };

            datasets.updateOne(query, updates, callback);
        },

        function (callback) {
            var query = { datasets: newName };
            var updates = { $set: { "datasets.$": oldName } };

            genes.updateMany(query, updates, callback);
        },

        function (callback) {
            var query = { datasets: newName };
            var updates = { $set: { "datasets.$": oldName } };

            updates.$rename = {};
            updates.$rename["metadata." + newName] = "metadata." + oldName;

            experiments.updateMany(query, updates, callback);
        },

        function (callback) {
            var query = { set: newName };
            var updates = { $set: { set: oldName } };

            data.updateMany(query, updates, callback);
        }
    ],

    function (err, results) {
        if (err) return callback();
        return callback();
    });
};

// ============================================================================

exports.DELETE = function () {

};
