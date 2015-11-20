/*
 * Angular controller for the "Add Annotations" section.
 *
 */

angular.module("cassandre").controller("AddAnnotationsController", [
    "$scope", "annotationsHttp", "allowedMimeTypes", "xlsxToJson", "tsvToJson",
    function ($scope, annotationsHttp, allowedMimeTypes, xlsxToJson, tsvToJson) {

    // The annotations File object to upload
    $scope.annotations = {
        file: ""
    };

    // Marker to know when data are uploading
    $scope.annotIsUploading = false;

    // Get all annotations
    $scope.showAnnotations = function () {
        $scope.data.cells = annotationsHttp.get({}, function (data) {
            $scope.cellsToRows(data, "column", "row", "value");
            console.log($scope.data.rows);
        });
    };

    // Parse the file depending on its type
    $scope.parseFile = function () {

        // Excel files
        if ($scope.annotations.file.type === allowedMimeTypes["xlsx"]) {
            xlsxToJson($scope.annotations.file, function (err, json) {
                $scope.$apply(function () {
                    $scope.data.rows = json;
                });
            });
        }

        // TSV files
        else if ($scope.annotations.file.type === allowedMimeTypes["tsv"] || $scope.annotations.file.type === allowedMimeTypes["txt"]) {99
            tsvToJson($scope.annotations.file, function (err, json) {
                $scope.$apply(function () {
                    $scope.data.rows = json;
                });
            });
        }

        else {
            alert("This file format is invalid.");
        }
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
        }, function (err) {
            $scope.dataIsUploading = false;
            alert("Error : " + err.data);
        });
    }
}]);