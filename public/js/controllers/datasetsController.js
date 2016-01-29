/*
 * Angular controller for the "Datasets" section.
 *
 */

angular.module("cassandre").controller("DatasetsController", [
    "$scope", "$filter", "datasets", "experiments", "stats", "allowedFileTypes", "xlsxToJson", "tsvToJson",
    function ($scope, $filter, datasets, experiments, stats, allowedFileTypes, xlsxToJson, tsvToJson) {

    // ----- Database informations ---------------------------------------- //

    // List of the database statistics (data sets, experiments and genes)
    $scope.stats = stats.list();

    // ----- Data sets --------------------------------------------------- //

    $scope.sets = datasets.list.all();  // The whole data sets lists and markers
    $scope.filter = "";                 // The menu filter
    $scope.showHidden = false;          // Marker for the "Show all" buttons
    $scope.changes = {                  // When changing a data set informations
        datasetName: "",
        newName: "",
        description : ""
    };

    // Function to select or deselect a data set
    $scope.select = function (name) {
        datasets.select.one(name);
    };

    // Function to check/uncheck all
    $scope.selectAll = function () {
        datasets.select.all();
    };

    // Hide a data set in the menu
    $scope.hide = function (name) {
        datasets.hide(name);
    };

    // Make a data set visible in the menu
    $scope.show = function (name) {
        datasets.show(name);
    };

    // Set the modal information when modifying a dataset
    $scope.edit = function (set) {
        $scope.changes.datasetName = set.name;
        $scope.changes.newName = set.name;
        $scope.changes.description = set.description;
    };

    // Update data sets informations
    $scope.update = function () {
        datasets.update($scope.changes);
    };
    
    // Remove a data set
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

    // Data set file to upload
    $scope.dataset = {
        file: null,                 // The entire FileObject
        name: "",                   // The name, possibly modified by the user
        description: "",            // A description of the data set
        validator: "^[^$.][^.]*$"   // Validator to ensure the name is Mongo-field compatible
    };

    // The file of experiments metadata if there's one
    $scope.metadata = {
        file: null
    };

    // List of allowed formats displayed in the view
    $scope.formats = allowedFileTypes.extensions.join(", ");

    // Parse a file depending on its type
    $scope.parseFile = function (file) {
        if (!$scope.dataset.file && !$scope.metadata.file) {
            alert("Nothing to display.");
        }
        // Need to handle which one of the file is parsed

        // Excel files
        else if (allowedFileTypes.mime.excel.indexOf(file.type) > -1) {
            xlsxToJson(file, function (err, json) {
                $scope.$apply(function () {
                    $scope.data.rows = json;
                });
            });
        }

        // TSV files
        else if (allowedFileTypes.mime.text.indexOf(file.type) > -1) {
            tsvToJson(file, function (err, json) {
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

        if ($scope.metadata.file) {
            allData.append("metadata", $scope.metadata.file);
        }

        datasets.add(allData);
    };
}]);
