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
 * Main controller of Cassandre for the display section.
 *
 */

angular.module("cassandre").controller("MainController", [
    "$rootScope", "$scope", "$compile", "$filter", "jsonToTsv", "datasets", "experiments", "genes", "data", "config",
    function ($rootScope, $scope, $compile, $filter, jsonToTsv, datasets, experiments, genes, data, config) {

    $scope.data = {
        cells: [],                      // Data from database
        rows: []                        // Data formatted in rows
    };

    $scope.isLoading = false;           // Marker to know when data are loading

    $scope.datasets = datasets.list.all();
    $scope.exps = experiments.list.all();
    $scope.genes = genes.list.all();

    // NAVBAR
    // ========================================================================

    // Control switch for the displayed section
    $scope.activeSection = "datasetsSection";
    $scope.activate = function (section) {
        $scope.activeSection = section;
    };

    // Interface configuration
    $scope.config = $rootScope.config;

    // Update the interface configuration
    $scope.updateConfig = function () {
        config.update({}, $scope.config, function () {
            alert("Configuration successfully updated");
        }, function (err) {
            alert("Error :" + err.data);
        });
    };

    // RESULTS
    // ========================================================================

    // Used for ordering the results and mark the columns
    $scope.predicate = "";
    $scope.reverse = false;

    // Get the data for the selected genes and/or exp
    $scope.getData = function () {
        if ($scope.genes.selected.length === 0 && $scope.exps.selected.length === 0) {
            alert("No " + $scope.config.rowsName.singular + " or " + $scope.config.columnsName.singular + " selected.");
            return;
        }

        $scope.data.cells = data.get({
            sets: encodeURIComponent($scope.datasets.selected),
            exps: $scope.exps.selected,
            genes: $scope.genes.selected
        }, function (data) {
            $scope.cellsToRows(data);
        });
    };

    $scope.limit = 10;
    $scope.limitOptions = {
        "Limit to 10 lines": 10,
        "Limit to 20 lines": 20,
        "Limit to 50 lines": 50,
        "Limit to 100 lines": 100,
        "Limit to 300 lines": 300
    };

    $scope.filters = {
        active: false,
        list: {},
        reset: function () {
            this.list = {};
        }
    };

    // Handle the data URI of the display table for the download
    $scope.download = {
        href: "",
        emptyCells: "",
        setHref: function () {
            this.href = "data:text/plain;charset=utf-8," + encodeURI(jsonToTsv($scope.data.rows, this.emptyCells));
        }
    };

    // Erase the table results
    $scope.erase = function () {
        $scope.data.rows = [];
    };

    // Format data into rows to ease the display in the view
    $scope.cellsToRows = function(cells) {
        $scope.data.rows = [];
        var headers = [];
        var rows = {};

        // Build the headers
        // The column name is attached with the dataset name to avoid conflicts
        cells.forEach(function (cell) {
            var header = cell.exp.concat(" - ", cell.set);

            if (headers.indexOf(header) === -1) {
                headers.push(header);
            }
        });

        // Sort to have the same headers side to side in the display
        headers.sort();

        // Build the rows
        cells.forEach(function (cell) {
            var header = cell.exp.concat(" - ", cell.set);

            // Add the row if not yet present
            if (!rows[cell.gene]) {
                rows[cell.gene] = {};
                headers.forEach(function (header) {
                    rows[cell.gene][header] = null;
                });
            }

            // Add the value at the right place
            rows[cell.gene][header] = cell.value;
        });

        // Then format rows in an array of objects with headers as keys
        for (var gene in rows) {
            var newRow = { "ID": gene };

            for (var header in rows[gene]) {
                newRow[header] = rows[gene][header];
            };

            $scope.data.rows.push(newRow);
        }
    };

    // Ordering function
    $scope.order = function (header, reverse) {
        $scope.predicate = header;
        $scope.reverse = reverse;
        $scope.data.rows = $filter("orderBy")($scope.data.rows, "'" + header.replace(/['"]/g, "\\$&") + "'", reverse);
    };

    // MENU
    // ========================================================================

    $scope.graphBlocks = [];
    $scope.displayedBlock = "";
    $scope.remove = function (blockID) {
        angular.element("#" + blockID).remove();
        $scope.graphBlocks.splice($scope.graphBlocks.indexOf(blockID), 1);
    };

    // Generate the gene charts
    $scope.genePlot = {
        histogram: function () {
            if ($scope.genes.selected.length === 0) {
                alert("No " + $scope.config.rowsName.singular + " selected.");
                return;
            }

            $scope.data.cells = data.get({
                sets: encodeURIComponent($scope.datasets.selected),
                genes: $scope.genes.selected
            }, function (cells) {
                var blockID = $scope.config.rowsName.plural + Date.now();
                var graphDiv = angular.element("#visual");
                var graphBlock = angular.element("<graph-block-histogram></graph-block-histogram>")
                    .attr("id", blockID)
                    .attr("data-type", "{{ config.rowsName.plural }}")
                    .attr("data-datasets", "datasets.selected")
                    .attr("data-list", "genes.selected")
                    .attr("data-cells", "data.cells")
                    .attr("data-displayed-block", "displayedBlock")
                    .attr("data-remove", "remove(blockID)");

                graphDiv.append(graphBlock);
                $scope.graphBlocks.push(blockID);
                $compile(graphBlock)($scope);
            });
        },
        scatter: function () {
            if ($scope.genes.selected.length !== 2) {
                alert("Scatter plots needs two " + $scope.config.rowsName.plural + " to be generated.\n" +
                      "Currently selected: " + $scope.genes.selected.length + ".");
                return;
            }

            $scope.data.cells = data.get({
                sets: encodeURIComponent($scope.datasets.selected),
                genes: $scope.genes.selected
            }, function (cells) {
                var blockID = $scope.config.rowsName.plural + Date.now();
                var graphDiv = angular.element("#visual");
                var graphBlock = angular.element("<graph-block-scatter></graph-block-scatter>")
                    .attr("id", blockID)
                    .attr("data-type", "{{ config.rowsName.plural }}")
                    .attr("data-datasets", "datasets.selected")
                    .attr("data-list", "genes.selected")
                    .attr("data-cells", "data.cells")
                    .attr("data-displayed-block", "displayedBlock")
                    .attr("data-remove", "remove(blockID)");

                graphDiv.append(graphBlock);
                $scope.graphBlocks.push(blockID);
                $compile(graphBlock)($scope);
            });
        }
    };

    // Generate the experiment charts
    $scope.expPlot = {
        histogram: function () {
            if ($scope.exps.selected.length === 0) {
                alert("No " + $scope.config.columnsName.singular + " selected.");
                return;
            }

            $scope.data.cells = data.get({
                sets: encodeURIComponent($scope.datasets.selected),
                exps: $scope.exps.selected
            }, function (cells) {
                var blockID = $scope.config.columnsName.plural + Date.now();
                var graphDiv = angular.element("#visual");
                var graphBlock = angular.element("<graph-block-histogram></graph-block-histogram>")
                    .attr("id", blockID)
                    .attr("data-type", "{{ config.columnsName.plural }}")
                    .attr("data-datasets", "datasets.selected")
                    .attr("data-list", "exps.selected")
                    .attr("data-cells", "data.cells")
                    .attr("data-displayed-block", "displayedBlock")
                    .attr("data-remove", "remove(blockID)");

                graphDiv.append(graphBlock);
                $scope.graphBlocks.push(blockID);
                $compile(graphBlock)($scope);
            });
        },
        scatter: function () {
            if ($scope.exps.selected.length !== 2) {
                alert("Scatter plots needs two " + $scope.config.columnsName.plural + " to be generated.\n" +
                      "Currently selected: " + $scope.exps.selected.length + ".");
                return;
            }

            $scope.data.cells = data.get({
                sets: encodeURIComponent($scope.datasets.selected),
                exps: $scope.exps.selected
            }, function (cells) {
                var blockID = $scope.config.columnsName.plural + Date.now();
                var graphDiv = angular.element("#visual");
                var graphBlock = angular.element("<graph-block-scatter></graph-block-scatter>")
                    .attr("id", blockID)
                    .attr("data-type", "{{ config.columnsName.plural }}")
                    .attr("data-datasets", "datasets.selected")
                    .attr("data-list", "exps.selected")
                    .attr("data-cells", "data.cells")
                    .attr("data-displayed-block", "displayedBlock")
                    .attr("data-remove", "remove(blockID)");

                graphDiv.append(graphBlock);
                $scope.graphBlocks.push(blockID);
                $compile(graphBlock)($scope);
            });
        }
    };

}]);
