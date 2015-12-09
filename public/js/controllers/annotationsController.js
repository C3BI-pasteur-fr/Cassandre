/*
 * Angular controller for the "Add Annotations" section.
 *
 */

angular.module("cassandre").controller("AnnotationsController", [
    "$scope", "genes", "annotationsHttp", "allowedFileTypes", "xlsxToJson", "tsvToJson",
    function ($scope, genes, annotationsHttp, allowedFileTypes, xlsxToJson, tsvToJson) {

    $scope.genes = genes.list.all();

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
        if (allowedFileTypes.mime.excel.indexOf($scope.annotations.file.type) > -1) {
            xlsxToJson($scope.annotations.file, function (err, json) {
                $scope.$apply(function () {
                    $scope.data.rows = json;
                });
            });
        }

        // TSV files
        else if (allowedFileTypes.mime.text.indexOf($scope.annotations.file.type) > -1) {
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

    // Get all annotations
    $scope.showAnnotations = function () {
        if (Object.keys($scope.genes.annotations).length > 0) {
            $scope.data.rows = [];

            // Turn the object into an array of objects
            for (var gene in $scope.genes.annotations) {
                var row = $scope.genes.annotations[gene];
                row['ID'] = gene;
                $scope.data.rows.push(row);
            }
        }
        else {
            alert("No annotations found in the database.")
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
            genes.get.annotations();
        }, function (err) {
            $scope.dataIsUploading = false;
            alert("Error : " + err.data);
        });
    }
}]);