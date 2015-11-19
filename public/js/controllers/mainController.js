
/*
 * Main controller of Cassandre for the display section.
 *
 */

angular.module("cassandre").controller("MainController", [
    "$scope", "$filter", "$http", "jsonToTsv", "datasetsHttp", "annotations", "genes", "expHttp", "data",
    function ($scope, $filter, $http, jsonToTsv, datasetsHttp, annotations, genes, expHttp, data) {

    $scope.data = {
        cells: [],                      // Data from database
        rows: []                        // Data formatted in rows
    };

    $scope.dataHref = "#";              // Data URI of the display table for the download
    $scope.isLoading = false;           // Marker to know when data are loading

    // ----- Variables -------------------------------------------------- //

    // Control switch for the displayed section
    $scope.activeSection = "experimentsSection";

    // Used for ordering the results and mark the columns
    $scope.predicate = "";
    $scope.reverse = false;

    // Lists in the selection menu
    $scope.lists = {
        datasets: [],
        genes: [],
        exp: []
    };

    // Contains the menu rows selected by the user
    $scope.selected = {
        genes: [],
        exp: []
    };

    // Filter bars in the menu
    $scope.filters = {
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
        $scope.data.cells = data.get({
            mId: encodeURIComponent($scope.selected.datasets),
            expId: $scope.selected.exp,
            geneId: $scope.selected.genes
        }, function (data) {
            $scope.cellsToRows(data, "expId", "geneId", "value");
        });
    };

    // Format data into rows to ease the display in the view
    $scope.cellsToRows = function(data, colName, rowName, valueName) {
        $scope.data.rows = [];
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

            $scope.data.rows.push(newRow);
        }
    };

    // Ordering function
    $scope.order = function (header, reverse) {
        $scope.predicate = header;
        $scope.reverse = reverse;
        $scope.data.rows = $filter("orderBy")($scope.data.rows, "'" + header + "'", $scope.reverse);
    };

    // Set the data URI of the display table for the download
    $scope.download = function () {
        $scope.dataHref = "data:text/plain;charset=utf-8," + encodeURI(jsonToTsv($scope.data.rows));
    };
}]);
