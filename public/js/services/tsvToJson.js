/*
 * Service to read and parse a TSV file.
 * Return the content in JSON format.
 *
 */

angular.module("Cassandre").factory("tsvToJson", function tsvToJsonFactory() {

    return function (fileObject, callback) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var arrays = e.target.result
                .split(/\r\n|\n/g)                  // Get the lines into an array
                .map(function (element) {
                    return element.split("\t");     // Split each line into an array
                });


            // Separate headers form the rest
            var headers = arrays.shift();

            // Return a JSON array of objects
            return callback(null, arrays.map(function (array) {
                var row = {};

                for (var i = 0; i < array.length; i++) {
                    row[headers[i]] = array[i];
                }

                return row;
            }));
        };

        reader.readAsText(fileObject);
    }
});
