var path = require('path');
var mongoose = require('mongoose');

var Datasets = mongoose.model('Datasets', mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    description: {
        type: String
    },
    hidden: {
        type: Boolean
    }
}));

//var updateDataset = function (dataset, description, callback) {
//    Datasets.collection.update({
//        name: dataset
//    }, {
//        $set: {
//            description: description
//        }
//    }, function (err) {
//        if (err) {
//            return callback(err);
//        }
//        return callback(null);
//    });
//};

module.exports = {
    datasets: Datasets
};