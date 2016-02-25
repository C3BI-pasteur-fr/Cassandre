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

var express = require('express');
var bodyParser = require('body-parser');

var Database = require('./database');
var config = require('./config');
var router = require('./router');

Database.connect(function (err, db) {
    if (err) throw err;

    // SERVER
    // ========================================================================

    var app = express();

    // Configuration
    var serverPort = config('web.port', 8080);
    var serverHost = config('web.host', 'localhost');

    // Middlewares
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Database reference
    app.locals.db = db;
    app.locals.datasets = db.collection('datasets');
    app.locals.experiments = db.collection('experiments');
    app.locals.genes = db.collection('genes');
    app.locals.data = db.collection('data');

    // Start
    app.listen(serverPort, serverHost, function () {
        console.log('Server listening to ' + serverHost + ' on port ' + serverPort);
        router(app);
    });

    // EXIT HANDLERS
    // ========================================================================

    var gracefulExit = function (signal, code) {
        db.close(function (err) {
            if (err) throw err;
            console.log("Application terminated on " + signal);
            process.exit(code);
        });
    };

    process.on('SIGINT', function () {
        gracefulExit('SIGINT', 130);
    });

    process.on('SIGTERM', function () {
        gracefulExit('SIGTERM', 143);
    });
});
