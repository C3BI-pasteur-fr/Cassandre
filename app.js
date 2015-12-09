#!/usr/bin/env node

/*
 * Handle the connection to MongoDB and the server configuration.
 * Then pass the app and the db to the router.
 *
 */

var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var config = require('./config');
var router = require('./router');

var host = config('db.host', 'localhost');
var port = config('db.port', 27017);
var database = config('db.dbName', 'cassandre');

var url = format('mongodb://%s:%d/%s', host, port, database);

MongoClient.connect(url, function (err, db) {
    if (err) {
        throw err;
    }

    console.log('Connected to the ' + database + ' database on port ' + port);

    // SERVER CONGIGURATION
    // =========================================================================

    var app = express();

    var serverPort = config('web.port', 8080);
    var serverHost = config('web.host', 'localhost');

    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.listen(serverPort, serverHost, function () {
        console.log('Server listening to ' + serverHost + ' on port ' + serverPort);
        router(app, db);
    });

    // EXIT HANDLERS
    // =========================================================================

    var gracefulExit = function (signal, code) {
        db.close(function (err) {
            if (err) {
                throw err;
            }

            console.log("Application terminated on " + signal);
            process.exit(code);
        });
    }

    db.on('close', function () {
        console.log('Closing connection with the ' + database + ' database');
    });

    process.on('SIGINT', function () {
        gracefulExit('SIGINT', 130);
    });

    process.on('SIGTERM', function () {
        gracefulExit('SIGTERM', 143);
    });
});
