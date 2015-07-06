/*
 * Service to read and parse a TSV file.
 * Return the content in JSON, formatted for the database.
 *
 */

angular.module("Cassandre").factory("tsvToJson", function tsvToJsonFactory() {

    return function (fileObject, callback) {
        var reader = new FileReader();
        var collections = [];
        
        reader.onload = function (e) {
            var arrays = e.target.result
                .split(/\r\n|\n/g)                  // Get the lines into an array
                .map(function (element) {
                    return element.split("\t");     // Split each line into an array
                });

            var headers = arrays.shift();           // Separate headers form the rest

            arrays.forEach(function (row) {
                for (var i = 1; i < row.length; i++) {
                    collections.push({
                        column: headers[i],
                        row: row[0],
                        value: row[i]
                    });
                }
            });
            
            return callback(null, collections);
        };

        reader.readAsText(fileObject);
    }
});
