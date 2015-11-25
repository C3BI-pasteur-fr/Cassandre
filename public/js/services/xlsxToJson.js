/*
 * Service to read and parse a XLSX file.
 * Return the content in JSON, formatted in rows for the display.
 *
 * Since Excel doesn't store any empty cell, we need
 * to go through the whole sheet manually.
 *
 */


angular.module("cassandre").factory("xlsxToJson", function xlsxToJsonFactory() {

    return function (fileObject, callback) {
        var reader = new FileReader();

        reader.onload = function (e) {

            // Get the entire excel file
            var workbook = XLSX.read(e.target.result, {
                type: "binary"
            });

            // Get the first sheet only
            var sheet = workbook.Sheets[workbook.SheetNames[0]];

            // Get the range of the sheet
            var range = XLSX.utils.decode_range(sheet["!ref"]);
            var table = [];
            var cols = [];

            // Get the column letters
            for (var colNum = range.s.c; colNum <= range.e.c; colNum++) {
                cols[colNum] = XLSX.utils.encode_col(colNum);
            }

            // Go through each row, except the first one (the headers)
            for (var R = range.s.r + 1; R <= range.e.r; R++) {
                var row = {};
                var rowNum = (R + 1).toString();

                // Get every cell of that row
                for (var colNum = range.s.c; colNum <= range.e.c; colNum++) {

                    // Adresses
                    var cell = cols[colNum] + rowNum;
                    var header = cols[colNum] + (range.s.c + 1) ;

                    // Do nothing if a header is absent
                    if (!sheet[header]) {
                        continue;
                    }

                    // Add the cell text value to the row and handle empty cells
                    row[sheet[header].w] = sheet[cell] ? sheet[cell].w : "";
                }

                table.push(row);
            }

            return callback(null, table);
        }

        reader.readAsBinaryString(fileObject);
    };
});
