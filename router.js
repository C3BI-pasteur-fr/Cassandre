var program = require('commander');
var mongoose = require('mongoose');
var color = require('colors');
var _ = require('underscore');

var WebServer = require('./web');
var Measurement = require('./measurement').measurement;
var MeasurementExp = require('./measurement').measurementExp;
var MeasurementGene = require('./measurement').measurementGene;
var loadMeasFile = require('./measurement').loadMeasFile;

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

    program.command('load-unchecked <fileName>')
        .alias('lu')
        .description('Load a measurements file in the database (using bulk inserts, with no data validation)')
        .action(function(){
                    var exit = function(){
                        console.info('done loading, exiting.'.green);
                        process.exit();
                    }
                    loadMeasFile(exit);
                });

    program.command('addCell <measurement> <experience> <gene> <value>')
        .alias('a')
        .description('add a single measuremet entry in the database')
        .action(function(measurement, experience, gene, value, env) {
            var newMeasurement = new Measurement({
                "measId": measurement,
                "expId": experience,
                "geneId": gene,
                "value": value
            });
            newMeasurement.save(function(err, newMeasurement) {
                if (err) return console.error(err);
                console.log("added a new measurement " + newMeasurement.toString().red);
                process.exit();
            });
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
