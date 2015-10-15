
/*
 * Service used to format the displayed data so it can be
 * downloaded by the user.
 *
 */

angular.module("cassandre").factory("jsonToTsv", function writeDataFactory() {
    return function (data) {

        // Ensure the order of the columns
        var orderedKeys = Object.keys(data[0]);

        // Strip angular $$hashKey property
        orderedKeys.splice(orderedKeys.indexOf("$$hashKey"), 1);

        // Setting the headers
        var tsv = orderedKeys.join("\t").concat("\n");

        for (var i = 0; i < data.length; i++) {
            var row = data[i];

            for (var j = 0; j < orderedKeys.length; j++) {
                var key = orderedKeys[j];

                // The last value of each row get a new line instead of a tab
                if (j !== orderedKeys.length - 1) {
                    tsv = tsv.concat(row[key], "\t");
                }
                else {
                    tsv = tsv.concat(row[key], "\n");
                }
            }
        }

        return tsv;
    }
});
