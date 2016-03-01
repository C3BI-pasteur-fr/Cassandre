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

var fs = require('fs');
var parseFile = require('../lib/parseFile');
var rollback = require('./annotationsRollbacks');

// ============================================================================

// Insert the genes annotations file into the database
exports.POST = [

    // Handle the file
    function (req, res, next) {
        req.app.locals.annotationsFileHandler(req, res , function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Insert the annotations into the genes collection
    function (req, res, next) {

        // Get the collection
        var genes = req.app.locals.genes;

        parseFile(req.file, function (err, annotations) {
            if (err) {
                return next({ status: 400, message: err.message})
            }

            var geneList = Object.keys(annotations);
            var bulk = genes.initializeUnorderedBulkOp();

            geneList.forEach(function (gene) {
                var updates = {};

                for (var field in annotations[gene]) {
                    updates['annotation.' + field] = annotations[gene][field];
                }

                bulk.find({ ID: gene })
                    .upsert()
                    .updateOne({
                        $set: updates,
                        $setOnInsert: { 'datasets': [] },
                    }
                );
            });

            bulk.execute(function (err) {
                if (err) return next({ status: 500, message: err.message});
                res.sendStatus(201);
                return next();
            });
        });
    },

    // Error handler
    function (err, req, res, next) {
        console.log(err);

        if (err.status) {
            res.status(err.status).send(err.message);
        }
        else {
            res.status(500).send(err.message);
        }

        rollback.INSERT(req.app.locals.db, function (err) {
            if (err) return next(err);
            return next();
        });
    },

    // Remove the files from the system, errors or not
    function (req, res, next) {
        fs.unlinkSync(req.file.path);
    }
];

// ============================================================================

// Remove the genes annotations from the database.
// Also remove the genes that no longer appear
// in any dataset and have no annotation.
exports.DELETE = function (req, res) {

    // Get the collection
    var genes = req.app.locals.genes;
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

    bulk.execute(function (err) {
        if (err) return res.status(500).send(err.message);
        return res.sendStatus(204);
    });
};
