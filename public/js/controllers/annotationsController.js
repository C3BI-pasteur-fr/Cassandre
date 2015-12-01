/*
 * Angular controller for the "Add Annotations" section.
 *
 */

angular.module("cassandre").controller("AnnotationsController", [
    "$scope", "genes", "annotationsHttp", "allowedFileTypes", "xlsxToJson", "tsvToJson",
    function ($scope, genes, annotationsHttp, allowedFileTypes, xlsxToJson, tsvToJson) {

    // The annotations File object to upload
    $scope.annotations = {
        file: ""
    };

    // Marker to know when data are uploading
    $scope.annotIsUploading = false;

    // List of allowed formats displayed in the view
    $scope.formats = allowedFileTypes.extensions.join(", ");

    // Parse the file depending on its type
    $scope.parseFile = function () {

        // Excel files
        if (allowedFileTypes.mime.excel.indexOf($scope.dataset.file.type) > -1) {
            xlsxToJson($scope.dataset.file, function (err, json) {
                $scope.$apply(function () {
                    $scope.data.rows = json;
                });
            });
        }

        // TSV files
        else if (allowedFileTypes.mime.text.indexOf($scope.dataset.file.type) > -1) {
            tsvToJson($scope.dataset.file, function (err, json) {
                $scope.$apply(function () {
                    $scope.data.rows = json;
                });
            });
        }

        else {
            alert("This file format is invalid.");
        }
    };

    // Get all annotations
    $scope.showAnnotations = function () {
        $scope.data.cells = annotationsHttp.get({}, function (data) {
            $scope.cellsToRows(data, "column", "row", "value");
        });
    };

    // Send the file to the server using a FormData
    $scope.sendFile = function () {
        var allData = new FormData();

        allData.append("annotations", $scope.annotations.file);

        $scope.annotIsUploading = true;

        annotationsHttp.add(allData, function () {
            $scope.annotIsUploading = false;
            alert("Annotations successfully stored.");
            document.getElementById("dataUploadForm").reset(); // No better solution found with Angular
            genes.getAnnotations();
        }, function (err) {
            $scope.dataIsUploading = false;
            alert("Error : " + err.data);
        });
    }
}]);