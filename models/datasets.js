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
    },
    postedDate: {
        type: Date
    }
}));

module.exports = {
    datasets: Datasets
};