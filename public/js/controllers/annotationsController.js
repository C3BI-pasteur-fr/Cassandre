/*
 * Copyright (C) 2016 Simon Malesys - Institut Pasteur
 *
 * This file is part of Cassandre
 *
 * Cassandre is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Cassandre is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

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
        if ($scope.genes.annotationsFields.length === 0) {
            alert("No annotations found in the database.");
            return;
        }

        $scope.data.rows = [];

        // Turn the object into an array of objects
        for (var ID in $scope.genes.all) {
            var row = { "ID": ID };

            $scope.genes.annotationsFields.forEach(function (field) {
                row[field] = $scope.genes.all[ID].annotation[field];
            });

            $scope.data.rows.push(row);
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
