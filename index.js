var route = require('./router');
var getConf = require('./config');
var connected = require('./db').connected
connected(route, 'mongodb://'+getConf('db.host', 'localhost')+':'+getConf('db.port', '27017'));
