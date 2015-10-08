
/*
 * Service to read and parse a TSV file.
 * Return the content in JSON, formatted in rows for the display.
 *
 */

angular.module("Cassandre").factory("tsvToJson", ["cast", function tsvToJsonFactory(cast) {

    return function (fileObject, callback) {
        var reader = new FileReader();
        var rows = [];

        reader.onload = function (e) {
            var arrays = e.target.result
                .trim()
                .split(/\r\n|\n/g)                  // Get the lines into an array
                .map(function (line) {
                    return line.split("\t");        // Split each line into an array
                });

            var headers = arrays.shift();           // Separate headers form the rest

            arrays.forEach(function (array) {       // Build the JSON
                var row = {};

                array.forEach(function (element, index) {
                    row[headers[index]] = cast(element);
                })

                rows.push(row);
            });

            return callback(null, rows);
        };

        reader.readAsText(fileObject);
    }
}]);
