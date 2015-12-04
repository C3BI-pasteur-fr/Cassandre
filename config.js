var config = require ('config');

var getConf = function (key, def){
    if (config.has(key)) {
        return config.get(key);
    }
    else {
        return def;
    }
};

module.exports = getConf;
