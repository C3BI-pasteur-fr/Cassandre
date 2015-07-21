var route = require('./router');
var connected = require('./db').connected
connected(route, 'mongodb://localhost/cassandre');
