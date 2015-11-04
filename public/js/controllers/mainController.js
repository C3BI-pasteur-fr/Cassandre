
/*
 * Main controller of Cassandre for the display section.
 *
 */

angular.module("cassandre").controller("MainController", [
    "$scope", "$filter", "$http", "jsonToTsv", "statistics", "datasets", "annotations", "genes", "exp", "data",
    function ($scope, $filter, $http, jsonToTsv, statistics, datasets, annotations, genes, exp, data) {

    $scope.dataCells = [];              // Data from database
    $scope.dataRows = [];               // Data formatted in rows
    $scope.dataHref = "#";              // Data URI of the display table for the download
    $scope.isLoading = false;           // Marker to know when data are loading

    // ----- Variables -------------------------------------------------- //

    // Total numbers of datasets, experiments and genes
    $scope.dbStats = {
        total: {},
        selected: {}
    };

    // Control switch for the displayed section
    $scope.activeSection = "addDatasetsSection";

    // When making changes to a dataset
    $scope.datasetChanges = {
        name: "",
        newName: "",
        description : ""
    };

    // Used for ordering the results and mark the columns
    $scope.predicate = "";
    $scope.reverse = false;

    // Marker for the datasets menu
    $scope.showHiddenDatasets = false;

    // Lists in the selection menu
    $scope.lists = {
        datasets: [],
        genes: [],
        exp: []
    };

    // Contains the menu rows selected by the user
    $scope.selected = {
        datasets: [],
        genes: [],
        exp: []
    };

    // Filter bars in the menu
    $scope.filters = {
        datasets: "",
        genes: ""
    };

    // Limits for display
    $scope.limits = {
        genes: 10,
        results: 10
    };

    // Options for the limit dropdowns
    $scope.limitsOptions = {
        "10": 10,
        "20": 20,
        "50": 50,
        "100": 100,
        "No Limit": undefined
    };

    // ----- Initialization --------------------------------------------- //

    // Get the stats of the database
    statistics.get(function (stats) {
        $scope.dbStats.total = stats;
        $scope.dbStats.selected = stats;
    });

    // Get the datasets and then the experiments
    datasets.list(function (datasets) {
        $scope.lists.datasets = datasets;
        $scope.selectAll("datasets");
        $scope.lists.exp = exp.list({
            mId: encodeURIComponent($scope.selected.datasets)
        });
    });

    // ----- Watchers on the Wall --------------------------------------- //

    // Refresh the stats panel when datasets selection changes
    $scope.$watch("selected.datasets", function (newSet, oldSet) {

        // Spare a pointless request
        if (newSet.length === 0) {
            $scope.dbStats.selected = {
                datasets: 0,
                exp: 0,
                genes: 0
            };
        }

        // Get the new stats to the database and the new list of experiments
        else if (!angular.equals(newSet, oldSet)) {
            statistics.get({ datasets: newSet }, function (newStats) {
                $scope.dbStats.selected = newStats;
            });

            $scope.lists.exp = exp.list({
                mId: encodeURIComponent($scope.selected.datasets)
            });
        }

    }, true);

    // ------------------------------------------------------------------ //

    // Return the filtered lists that appear in the menus
    $scope.filtered = function (list, showHidden) {
        var filteredList = $scope.lists[list];

        // Special filtering for datasets only
        if (list === "datasets" && !showHidden) {
            filteredList = filteredList.filter(function (element) {
                return !element.hidden;
            });
        }

        filteredList = $filter("filter")(filteredList, $scope.filters[list]);
        filteredList = $filter("limitTo")(filteredList, $scope.limits[list]);

        return filteredList;
    };

    // Function to select dataset, exp or gene
    $scope.select = function (list, element) {
        var index = $scope.selected[list].indexOf(element);

        if ( index > -1) {
            $scope.selected[list].splice(index, 1);
        }

        else {
            $scope.selected[list].push(element);
        }
    };

    // Function to check/uncheck all
    $scope.selectAll = function (list) {
        if ($scope.selected[list].length !== $scope.filtered(list).length) {

            // Map to handle the fact that datasets are objects
            $scope.selected[list] = $scope.filtered(list).map(function (element) {
                return typeof(element) === "object" ? element.name : element;
            });
        }

        else {
            $scope.selected[list] = [];
        }
    }

    // Get the lists for the given datasets
    $scope.searchData = function () {
        $scope.lists.exp = exp.list({
            mId: encodeURIComponent($scope.selected.datasets)
        });

        $scope.lists.genes = genes.list({
            mId: encodeURIComponent($scope.selected.datasets)
        });
    };

    // Get the data for the selected genes and/or exp
    $scope.getData = function () {
        $scope.dataCells = data.get({
            mId: encodeURIComponent($scope.selected.datasets),
            expId: $scope.selected.exp,
            geneId: $scope.selected.genes
        }, function (data) {
            $scope.cellsToRows(data, "expId", "geneId", "value");
        });
    };

    // Format data into rows to ease the display in the view
    $scope.cellsToRows = function(data, colName, rowName, valueName) {
        $scope.dataRows = [];
        var headers = [];
        var rows = {};

        // List the headers
        data.forEach(function (cell) {
            if (headers.indexOf(cell[colName]) === -1) {
                headers.push(cell[colName]);
            }
        });

        // Build the rows
        data.forEach(function (cell) {

            // Add the row if not yet present
            if (!rows[cell[rowName]]) {
                rows[cell[rowName]] = {};
                headers.forEach(function (header) {
                    rows[cell[rowName]][header] = null;
                });
            }

            // Add the value at the right place
            rows[cell[rowName]][cell[colName]] = cell[valueName];
        });

        // Then format rows in an array of objects with headers as keys
        for (var rowName in rows) {
            var newRow = { "ID": rowName };

            for (var header in rows[rowName]) {
                newRow[header] = rows[rowName][header];
            };

            $scope.dataRows.push(newRow);
        }
    };

    // Hide a dataset in the menu
    $scope.hide = function (id) {
        datasets.hide({
            id: encodeURIComponent(id)
        }, {
            hidden: true
        }, function () {
            // TO CHANGE
            $scope.lists.datasets = datasets.list();
        }, function (err) {
            alert("Error : " + err.data);
        });
    };

    // Make a dataset visible in the menu
    $scope.show = function (id) {
        datasets.show({
            id: encodeURIComponent(id)
        }, {
            hidden: false
        }, function () {
            // TO CHANGE
            $scope.lists.datasets = datasets.list();
        }, function (err) {
            alert("Error : " + err.data);
        });
    };

    // Update datasets informations
    $scope.update = function () {
        datasets.update({
            name: encodeURIComponent($scope.datasetChanges.name)
        }, {
            newName: $scope.datasetChanges.newName,
            description: $scope.datasetChanges.description
        }, function () {
            // TO CHANGE
            $scope.lists.datasets = datasets.list();
        }, function (err) {
            alert("Error : " + err.data);
        });
    };

    // Remove a dataset
    $scope.remove = function (name) {
        if (confirm("Do you really want to remove this dataset permanently?")) {
            datasets.remove({
                name: encodeURIComponent(name)
            }, function () {
                // TO CHANGE
                $scope.lists.datasets = datasets.list();
                $scope.dbStats.total = statistics.get();
            }, function (err) {
                alert("Error : " + err.data);
            });
        }
    };

    // Ordering function
    $scope.order = function (header, reverse) {
        $scope.predicate = header;
        $scope.reverse = reverse;
        $scope.dataRows = $filter("orderBy")($scope.dataRows, "'" + header + "'", $scope.reverse);
    };

    // Turn an ISO string date into a human readable string
    $scope.formatDate = function (date) {
        return date.replace(/T/, ' ')      // Replace T with a space
                   .replace(/\..+/, '');   // Delete the dot and everything after
    };

    // Set the data URI of the display table for the download
    $scope.download = function () {
        $scope.dataHref = "data:text/plain;charset=utf-8," + encodeURI(jsonToTsv($scope.dataRows));
    };
}]);
