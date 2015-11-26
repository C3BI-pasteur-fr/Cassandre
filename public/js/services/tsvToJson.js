
/*
 * Service to read and parse a TSV file.
 * Return the content in JSON, formatted in rows for the display.
 *
 */

angular.module("cassandre").factory("tsvToJson", ["cast", function tsvToJsonFactory(cast) {

    return function (fileObject, callback) {
        var reader = new FileReader();
        var rows = [];

        reader.onload = function (e) {
            var arrays = e.target.result
                .trim()
                .split(/\r\n|\n/g)              // Get the lines into an array
                .map(function (line) {          // Split each line into an array
                    return line.split("\t");
                });

            // Separate headers form the rest
            var headers = arrays.shift();

            // Build the JSON
            arrays.forEach(function (array) {
                var row = {};

                array.forEach(function (element, index) {
                    if (headers[index]) {
                        row[headers[index]] = cast(element);
                    }
                })

                rows.push(row);
            });

            return callback(null, rows);
        };

        reader.readAsText(fileObject);
    }
}]);
