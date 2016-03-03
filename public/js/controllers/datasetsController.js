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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

/*
 * Angular controller for the "Datasets" section.
 *
 */

angular.module("cassandre").controller("DatasetsController", [
    "$scope", "$filter", "datasets", "experiments", "genes", "data", "stats", "allowedFileTypes", "xlsxToJson", "tsvToJson",
    function ($scope, $filter, datasets, exps, genes, data, stats, allowedFileTypes, xlsxToJson, tsvToJson) {

    // ----- Database informations ---------------------------------------- //

    // List of the database statistics (data sets, experiments and genes)
    $scope.stats = stats.list();

    // ----- Data sets --------------------------------------------------- //

    $scope.sets = datasets.list.all();      // The whole data sets lists and markers
    $scope.exps = exps.list.all();          // All the experiments information
    $scope.genes = genes.list.all();        // All the genes information
    $scope.filter = "";                     // The menu filter
    $scope.showHidden = false;              // Marker for the "Show all" buttons
    $scope.changes = {                      // When changing a data set informations
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
    
    // Shortcuts to display some of the datasets content
    $scope.display = {
        experiments: function (dataset) {
            $scope.data.rows = [];

            for (var ID in $scope.exps.all) {
                if ($scope.exps.all[ID].datasets.indexOf(dataset) > -1) {

                    var metadata = $scope.exps.all[ID].metadata[dataset];
                    var row = { "ID": ID };

                    for (var field in metadata) {
                        row[field] = metadata[field];
                    }

                    $scope.data.rows.push(row);
                }
            }
        },
        genes: function (dataset) {
            $scope.data.rows = [];

            for (var ID in $scope.genes.all) {
                if ($scope.genes.all[ID].datasets.indexOf(dataset) > -1) {
                    var row = { "ID": ID };

                    $scope.genes.annotationsFields.forEach(function (field) {
                        row[field] = $scope.genes.all[ID].annotation[field];
                    });

                    $scope.data.rows.push(row);
                }
            }
        },
        data: function (dataset) {
            $scope.data.cells = data.get({
                sets: encodeURIComponent(dataset)
            }, function (data) {
                $scope.cellsToRows(data);
            });
        }
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
