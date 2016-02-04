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
        $scope.data.rows = [];

        // Turn the object into an array of objects
        $scope.genes.all.forEach(function (gene) {
            var row = {};

            if (gene.annotation) {
                row['ID'] = gene.ID;
                Object.assign(row, gene.annotation);
                $scope.data.rows.push(row);
            }
        });

        if ($scope.data.rows.length === 0) {
            alert("No annotations found in the database.")
        }
    };
    
    // Remove all annotations from the database
    $scope.deleteAnnotations = function () {
        if (confirm("Do you really want to remove all annotations permanently?")) {
            genes.remove.annotations();
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
            genes.get.all();
        }, function (err) {
            $scope.dataIsUploading = false;
            alert("Error : " + err.data);
        });
    }
}]);
