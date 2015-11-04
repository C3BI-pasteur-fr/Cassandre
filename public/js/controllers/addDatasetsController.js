/*
 * Angular controller for the "Add Datasets" section.
 *
 */

angular.module("cassandre").controller("AddDatasetsController", [
    "$scope", "allowedMimeTypes", "xlsxToJson", "tsvToJson",
    function ($scope, allowedMimeTypes, xlsxToJson, tsvToJson) {

    // Dataset file to upload
    $scope.dataset = {
        file: "",           // The File Object
        name: "",           // The name possibly modified by the user
        description: ""     // A description of the dataset
    };

    // Marker to know when data are uploading
    $scope.dataIsUploading = false;

    // Parse the file depending on its type
    $scope.parseFile = function () {
        var file = $scope.dataset.file;

        // Excel files
        if (file.type === allowedMimeTypes["xlsx"]) {
            xlsxToJson(file, function (err, json) {
                $scope.dataRows = json;
                $scope.$digest();
            });
        }

        // TSV files
        else if (file.type === allowedMimeTypes["tsv"] || file.type === allowedMimeTypes["txt"]) {
            tsvToJson(file, function (err, json) {
                $scope.dataRows = json;
                $scope.$digest();
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

        $scope.dataIsUploading = true;

        datasets.add(allData, function () {
            $scope.dataIsUploading = false;
            $scope.lists.datasets = datasets.list();
            $scope.dbStats.total = statistics.get();
            alert("Data successfully stored.");
            document.getElementById("dataUploadForm").reset(); // No better solution found with Angular
        }, function (err) {
            $scope.dataIsUploading = false;
            alert("Error : " + err.data);
        });
    }
}]);