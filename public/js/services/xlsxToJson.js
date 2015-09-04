
/*
 * Service to read and parse a XLSX file.
 * Return the content in JSON, formatted in rows for the display.
 *
 */

angular.module("Cassandre").factory("xlsxToJson", function xlsxToJsonFactory() {

    return function (fileObject, callback) {
        var reader = new FileReader();

        reader.onload = function (e) {
            
            // Get the entire excel file
            var workbook = XLSX.read(e.target.result, {
                type: "binary"
            });
            
            // Get the first sheet only
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            
            return callback(null, XLSX.utils.sheet_to_json(worksheet));
        }

        reader.readAsBinaryString(fileObject);
    };
});