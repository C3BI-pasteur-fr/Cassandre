
/*
 * Service to read and parse a XLSX file.
 * Return the content in JSON format.
 *
 */

angular.module("Cassandre").factory("xlsxToJson", function xlsxToJsonFactory() {

    return function (fileObject, callback) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var workbook = XLSX.read(e.target.result, {
                type: "binary"
            });

            workbook.SheetNames.forEach(function (Name) {
                var worksheet = workbook.Sheets[Name];
                return callback(null, XLSX.utils.sheet_to_json(worksheet));
            });
        }

        reader.readAsBinaryString(fileObject);
    };
});