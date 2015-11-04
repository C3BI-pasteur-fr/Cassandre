/*
 * Angular controller for the "Add Annotations" section.
 *
 */

angular.module("cassandre").controller("AddAnnotationsController", [
    "$scope", "allowedMimeTypes", "xlsxToJson", "tsvToJson",
    function ($scope, allowedMimeTypes, xlsxToJson, tsvToJson) {
    
    // The annotations File object to upload
    $scope.annotations = "";
    
    // Marker to know when data are uploading
    $scope.annotIsUploading = false;
    
    // Get all annotations
    $scope.getAnnotations = function () {
        $scope.dataCells = annotations.get({}, function (data) {
            $scope.cellsToRows(data, "column", "row", "value");
        });
    };

    // Parse the file depending on its type
    $scope.parseFile = function () {

        // Excel files    
        if (annotations.type === allowedMimeTypes["xlsx"]) {
            xlsxToJson(annotations, function (err, json) {
                $scope.dataRows = json;
                $scope.$digest();
            });
        }

        // TSV files
        else if (annotations.type === allowedMimeTypes["tsv"] || annotations.type === allowedMimeTypes["txt"]) {
            tsvToJson(annotations, function (err, json) {
                $scope.dataRows = json;
                $scope.$digest();
            });
        }

        else {
            alert("This file format is invalide.");
        }
    };

    // Send the file to the server using a FormData
    $scope.sendFile = function () {
        var allData = new FormData();

        allData.append("annotations", $scope.annotations);

        $scope.annotIsUploading = true;

        annotations.add(allData, function () {
            $scope.annotIsUploading = false;
            alert("Data successfully stored.");
            document.getElementById("dataUploadForm").reset(); // No better solution found with Angular
        }, function (err) {
            $scope.dataIsUploading = false;
            alert("Error : " + err.data);
        });
    }
}]);