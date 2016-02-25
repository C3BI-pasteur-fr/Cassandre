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

var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var config = require('./config');

// Create a new connection to MongoDB
exports.connect = function (callback) {

    // CONFIGURATION
    // ========================================================================

    var host = config('db.host', 'localhost');
    var port = config('db.port', 27017);
    var name = config('db.dbName', 'cassandre');

    var url = format('mongodb://%s:%d/%s', host, port, name);

    // ========================================================================

    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err;
        }

        console.log('Connected to the ' + name + ' database on port ' + port);

        // INDEXES
        // ====================================================================

        db.collection("datasets").createIndex({ name: 1 }, { unique: true, background: true });
        db.collection("genes").createIndex({ ID: 1 }, { unique: true, background: true });

        // EVENTS
        // ====================================================================

        db.on('close', function () {
            console.log('Closing connection with the ' + name + ' database');
        });

        // ====================================================================

        return callback(null, db);
    });
};
