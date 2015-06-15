var program = require('commander');
var mongoose = require('mongoose');
var color = require('colors');
var _ = require('underscore');

var Measurement = require('./measurement');
var tsvParser = require('./tsvParser');

var route = function(){
	program.option('-c, --colors', 'Use colors for printing');

	program.command('list')
		   .alias('l')
		   .description('List Measurements')
		   .action(function(env, options){
                mongoose.connect('localhost', 'cassandre');
                Measurement.find(function (err, measurements_list) {
                    if (err) return console.error(err);
                    console.log(measurements_list);
                    process.exit();
                });
			});

	program.command('load <fileName>')
		   .alias('a')
		   .description('Load a measurements file in the database')
		   .action(function(path, env){
                		mongoose.connect('localhost', 'cassandre');
				tsvParser(path, function(err, list){
                                    var saveNextItem = function(list){
					console.info(item);
					console.error(list.length);
                                        var item = list.pop();
                                        console.error(list.length);
                                        var newMeasurement = new Measurement({
			                    "measId": path,
			                    "expId": item.column,
			                    "geneId": item.row,
			                    "value": item.value
                			});
                                        newMeasurement.save(function(err,newMeasurement){
                                            if (err) console.error(err);
					    console.info('added item '.green + newMeasurement);
					    if(list.length>0){
					        saveNextItem(list);
					    }else{
					        console.info('done loading, exiting.'.green);
						process.exit();
					    }
					});
				}
                                saveNextItem(list);
				});
			});

	program.command('addCell <measurement> <experience> <gene> <value>')
		   .alias('a')
		   .description('add a single measuremet entry in the database')
		   .action(function(measurement, experience, gene, value, env){
                mongoose.connect('localhost', 'cassandre');
                var newMeasurement = new Measurement({
                    "measId": measurement,
                    "expId": experience,
                    "geneId": gene,
                    "value": value
                });
                newMeasurement.save(function(err, newMeasurement){
                    if (err) return console.error(err);
                    console.log("added a new measurement " + newMeasurement.toString().red);
                    process.exit();
				});
			});


	program.parse(process.argv);
};

module.exports = route;
