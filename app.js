#!/usr/bin/env node

var express = require("express");

// ----- Configuration -------------------------------------------------- //

var app = express();
var port = 8080;
var pid = process.pid;

// ----- Middlewares ---------------------------------------------------- //

app.use(express.static(__dirname + "/public"));             // Setting static content directory

// ----- Routing -------------------------------------------------------- //


// ----- Server --------------------------------------------------------- //

app.listen(port);