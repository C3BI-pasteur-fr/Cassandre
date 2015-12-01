/*
 * Angular service that list the allowed MIME types and extensions
 * for the upload of data sets or annotations files.
 *
 */

angular.module("cassandre").value("allowedFileTypes", {
    extensions: ["txt", "tsv", "xls", "xlsx"],
    mime : {
        excel: [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ],
        text: [
            "text/plain",
            "text/tab-separated-values"
        ]
    }
});
