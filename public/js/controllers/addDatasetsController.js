/*
 * Angular controller for the "Add Datasets" section.
 *
 */

angular.module("cassandre").controller("AddDatasetsController", [
    "$scope", "datasets", "allowedMimeTypes", "xlsxToJson", "tsvToJson",
    function ($scope, datasets, allowedMimeTypes, xlsxToJson, tsvToJson) {
    
    // The whole datasets lists and markers
    $scope.sets = datasets.list.all();

    // Dataset file to upload
    $scope.dataset = {
        file: "",           // The File Object
        name: "",           // The name, possibly modified by the user
        description: ""     // A description of the dataset
    };

    // Parse the file depending on its type
    $scope.parseFile = function () {
        
        // Excel files
        if ($scope.dataset.file.type === allowedMimeTypes["xlsx"]) {
            xlsxToJson($scope.dataset.file, function (err, json) {
                $scope.$apply(function () {
                    $scope.data.rows = json;
                });
            });
        }

        // TSV files
        else if ($scope.dataset.file.type === allowedMimeTypes["tsv"] || $scope.dataset.file.type === allowedMimeTypes["txt"]) {
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

    // Send the file to the server using a FormData
    $scope.sendData = function () {
        var allData = new FormData();

        // Put the name before the file to avoid problems with Multer on server side
        allData.append("name", $scope.dataset.name);
        allData.append("dataset", $scope.dataset.file);
        allData.append("description", $scope.dataset.description);

        datasets.add(allData);
    }
}]);