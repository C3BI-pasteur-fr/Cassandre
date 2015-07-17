var mongoose   = require('mongoose');

var connected = function(connectedCall, db_server, db_port){
    mongoose.connection.on("connected", function(ref) {
        console.log("Connected to " + db_server + " DB!");
        return connectedCall();
    });
    // If the connection throws an error
    mongoose.connection.on("error", function(err) {
        console.error('Failed to connect to DB ' + db_server + ' on startup ', err);
    });
    // When the connection is disconnected
    mongoose.connection.on('disconnected', function () {
        console.log('Mongoose default connection to DB :' + db_server + ' disconnected');
    });
    var gracefulExit = function() { 
        mongoose.connection.close(function () {
            console.log('Mongoose default connection with DB :' + db_server + ' is disconnected through app termination');
            process.exit(0);
        });
    }
    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);
    try{
        console.log("Trying to connect to DB " + db_server);
        mongoose.connect(db_server);
    }catch(err){
        console.log("Server initialization failed " , err.message);
    }
}; 
 
module.exports = {'connected': connected}
