var express = require('express');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var multer = require('multer');

var _ = require('underscore');
var edam = require("./edam").edam;


var router = function(app) {

    /* list all the EDAM terms */
    app.get('/api/edam/', function(req, res, next) {
        edam.collection.find(function (err, items) {
            console.log(items);
            return res.end(JSON.stringify(items));
        i});
    });

};

var WebServer = function(contacts) {
    var app = express();
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(serveStatic('../client/app', {
        'index': ['index.html']
    }));
    app.use(multer({
        dest: './uploads/',
        rename: function (fieldname, filename) {
            return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
        }
    }));
    server = app.listen(8080);
    router(app);
    console.log('Server listening at port 8080');
};

var launch = function() {
    WebServer();
};

module.exports = launch;
