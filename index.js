var route = require('./router');
var connected = require('./db').connected
connected(route, 'localhost');
