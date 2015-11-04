/*
 * Angular service that list the allowed MIME types for the upload of
 * datasets or annotations files.
 *
 */

angular.module("cassandre").value("allowedMimeTypes", {
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    tsv: "text/tab-separated-values"
});