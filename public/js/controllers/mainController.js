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
    "$rootScope", "$scope", "$filter", "jsonToTsv", "datasets", "experiments", "genes", "data", "config",
    function ($rootScope, $scope, $filter, jsonToTsv, datasets, experiments, genes, data, config) {

    $scope.data = {
        cells: [],                      // Data from database
        rows: [],                       // Data formatted in rows
        values: [],
        graphs: []                      // List of the graphs div IDs
    };

    $scope.isLoading = false;           // Marker to know when data are loading

    $scope.datasets = datasets.list.all();
    $scope.exps = experiments.list.all();
    $scope.genes = genes.list.all();

    // NAVBAR
    // ========================================================================

    // Control switch for the displayed section
    $scope.activeSection = "genesSection";
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

    // Display an histogram
    $scope.histogram = {
        genes: function () {
            if ($scope.genes.selected.length === 0) {
                return;
            }

            $scope.data.cells = data.get({
                sets: encodeURIComponent($scope.datasets.selected),
                genes: $scope.genes.selected
            }, function (cells) {
                var graphDiv = angular.element("#visual");
                var graphBlock = angular.element("<graph-block></graph-block>");
                var blockID = $scope.genes.selected.join("");

                $scope.data.graphs.push(blockID);
                graphBlock.attr("id", blockID);
                graphDiv.append(graphBlock);

                var layout = {
                    xaxis: { title: "Values" },
                    yaxis: { title: "Frequencies" },
                    bargap: 0.1,
                    autosize: false
                };

                var config = {
                    displaylogo: false,
                    showTips: true,
                    editable: true,
                    scrollZoom: true,
                    modeBarButtonsToRemove: [
                        "sendDataToCloud"
                    ],
                };

                // Build each graph for each line
                $scope.genes.selected.forEach(function (gene) {
                    var graphID = "graph" + gene;

                    var geneGraph = document.createElement("div");
                    geneGraph.setAttribute("id", graphID);
                    $scope.data.graphs.push(graphID);
                    graphBlock.append(geneGraph);

                    var values = cells
                    .filter(function (cell) {
                        return cell.gene === gene;
                    })
                    .map(function (cell) {
                        if (typeof cell.value === "number") {
                            return cell.value;
                        }
                        return 0;
                    });

                    var trace = {
                        x: values,
                        name: gene,
                        type: "histogram",
                        opacity: 0.7,
                    };

                    layout.title = gene;

                    Plotly.newPlot(geneGraph, [trace], layout, config);
                });
            });
        },

        exps: function () {
            if ($scope.exps.selected.length === 0) {
                return;
            }

            $scope.data.cells = data.get({
                sets: encodeURIComponent($scope.datasets.selected),
                exps: $scope.exps.selected
            }, function (cells) {

                var graphDiv = angular.element("#visual");
                graphDiv.empty();

                var layout = {
                    xaxis: { title: "Values" },
                    yaxis: { title: "Frequencies" },
                    bargap: 0.1,
                    autosize: false
                };

                var config = {
                    displaylogo: false,
                    showTips: true,
                    editable: true,
                    scrollZoom: true,
                    modeBarButtonsToRemove: [
                        "sendDataToCloud"
                    ],
                };

                // Build each graph for each line
                $scope.exps.selected.forEach(function (exp) {
                    var graphID = "graph" + exp;

                    var expGraph = document.createElement("div");
                    expGraph.setAttribute("id", graphID);
                    $scope.data.graphs.push(graphID);
                    graphDiv.append(expGraph);

                    var values = cells
                    .filter(function (cell) {
                        return cell.exp === exp;
                    })
                    .map(function (cell) {
                        if (typeof cell.value === "number") {
                            return cell.value;
                        }
                        return 0;
                    });

                    var trace = {
                        x: values,
                        name: exp,
                        type: "histogram",
                        opacity: 0.7,
                    };

                    layout.title = exp;

                    Plotly.newPlot(expGraph, [trace], layout, config);
                });
            });
        }
    }
}]);
