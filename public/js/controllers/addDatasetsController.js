/*
 * Angular controller for the "Add Datasets" section.
 *
 */

angular.module("cassandre").controller("AddDatasetsController", [
    "$scope", "datasets", "allowedFileTypes", "xlsxToJson", "tsvToJson",
    function ($scope, datasets, allowedFileTypes, xlsxToJson, tsvToJson) {
    
    // The whole datasets lists and markers
    $scope.sets = datasets.list.all();

    // Dataset file to upload
    $scope.dataset = {
        file: "",           // The entire FileObject
        name: "",           // The name, possibly modified by the user
        description: ""     // A description of the dataset
    };

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