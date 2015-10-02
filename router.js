var program = require('commander');
var mongoose = require('mongoose');
var color = require('colors');
var _ = require('underscore');

var WebServer = require('./web');
var Measurement = require('./models/measurement').measurement;
var loadFile = require('./models/measurement').loadFile;
var tsvParser = require('./lib/tsvParser');

var route = function() {
    program.option('-c, --colors', 'Use colors for printing');

    program.command('list')
        .alias('l')
        .description('List Measurements')
        .action(function(env, options) {
            Measurement.find(function(err, measurements_list) {
                if (err) return console.error(err);
                console.log(measurements_list);
                process.exit();
            });
        });

    program.command('load <fileName>')
        .alias('u')
        .description('Load a measurements file in the database')
        .action(function(path, env) {
            tsvParser(path, function(err, list) {
                var saveNextItem = function(list) {
                    var item = list.pop();
                    item.value = item.value ? item.value : undefined;
                    var newMeasurement = new Measurement({
                        "measId": path,
                        "expId": item.column,
                        "geneId": item.row,
                        "value": item.value
                    });
                    newMeasurement.save(function(err, newMeasurement) {
                        if (err) console.error(err, item);
                        if (list.length > 0) {
                            saveNextItem(list);
                        } else {
                            console.info('done loading, exiting.'.green);
                            process.exit();
                        }
                    });
                }
                saveNextItem(list);
            });
        });

    program.command('load-unchecked <fileName>')
        .alias('lu')
        .description('Load a measurements file in the database (using bulk inserts, with no data validation)')
        .action(function(){
            var exit = function(){
                console.info('done loading, exiting.'.green);
                process.exit();
            }
            loadFile(exit);
        });

    program.command('serve')
        .alias('s')
        .description('Launch HTTP server')
        .action(function(env){
            WebServer();
        });

    program.parse(process.argv);
};

module.exports = route;
