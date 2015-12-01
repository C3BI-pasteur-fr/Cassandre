/*
 * Angular controller for the "Datasets" section.
 *
 */

angular.module("cassandre").controller("DatasetsController", [
    "$scope", "$filter", "datasets", "experiments", "stats", "allowedFileTypes", "xlsxToJson", "tsvToJson",
    function ($scope, $filter, datasets, experiments, stats, allowedFileTypes, xlsxToJson, tsvToJson) {

    // ----- Database statistics ---------------------------------------- //

    // List of the database statistics (datasets, experiments and genes)
    $scope.stats = stats.list();

    // ----- Data sets --------------------------------------------------- //

    $scope.sets = datasets.list.all();  // The whole datasets lists and markers
    $scope.filter = "";                 // The menu filter
    $scope.showHidden = false;          // Marker for the datasets menu
    $scope.changes = {                  // When editing a dataset informations
        name: "",
        newName: "",
        description : ""
    };

    // Function to select or deselect a dataset
    $scope.select = function (name) {
        datasets.select.one(name);
    };

    // Function to check/uncheck all
    $scope.selectAll = function () {
        datasets.select.all();
    };

    // Hide a dataset in the menu
    $scope.hide = function (name) {
        datasets.hide(name);
    };

    // Make a dataset visible in the menu
    $scope.show = function (name) {
        datasets.show(name);
    };

    // Update datasets informations
    $scope.update = function () {
        datasets.update($scope.changes);
    };

    // Remove a dataset
    $scope.remove = function (name) {
        if (confirm("Do you really want to remove this dataset permanently?")) {
            datasets.remove(name);
        }
    };

    // Turn an ISO string date into a human readable string
    $scope.formatDate = function (date) {
        return date.replace(/T/, ' ')      // Replace T with a space
                   .replace(/\..+/, '');   // Delete the dot and everything after
    };

    // ----- Add a new set ---------------------------------------------- //

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
