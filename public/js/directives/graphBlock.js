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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

angular.module("cassandre").directive("graphBlock", ["$rootScope", function ($rootScope) {
    return {
        restrict: "E",
        templateUrl: "../../views/graphBlock.html",
        scope: {
            id: "@",                    // The id of the div
            type: "@",                  // The type of data, rows or columns
            datasets: "=",              // The list of selected datasets
            list: "=",                  // The list of selected rows or columns IDs
            cells: "=",                 // The list of the cells
            displayedBlock: "=",        // The id of the currently displayed block
            remove: "&"                 // The remove function from the parent controller
        },
        link: function (scope, block, attrs) {

            // The list of graph titles
            scope.graphList = [];

            // Function to display the blocks as an accordion
            scope.display = function () {
                scope.displayedBlock = scope.displayedBlock === attrs.id ? "" : attrs.id;
            };

            // Set the common layout of the graphs
            var layout = {
                xaxis: { title: "Values" },
                yaxis: { title: "Frequencies" },
                bargap: 0.1,
                autosize: false
            };

            // Set the common config of the graphs
            var config = {
                displaylogo: false,
                showTips: true,
                editable: true,
                scrollZoom: true,
                modeBarButtonsToRemove: [
                    "sendDataToCloud",
                    "autoScale2d"
                ],
            };

            // Build each graph
            scope.datasets.forEach(function (dataset) {
                scope.list.forEach(function (element) {

                    var values = scope.cells

                    // Get the right cells rows or the columns depending of the requested type
                    .filter(function (cell) {
                        if (cell.set === dataset) {
                            if (scope.type === $rootScope.config.rowsName.plural) {
                                return cell.gene === element;
                            }
                            else {
                                return cell.exp === element;
                            }
                        }
                    })

                    // Get the values and filter non-numeric ones
                    .map(function (cell) {
                        if (typeof cell.value === "number") {
                            return cell.value;
                        }
                    });

                    // Stop here if the current dataset doesn't contain this row or column
                    if (values.length === 0) {
                        return;
                    }

                    // Set the graph identifier
                    var graphID = attrs.id + Date.now();
                    layout.title = element + " - " + dataset;

                    // Build the graph div
                    var graph = angular.element("<div></div>")
                        .attr("id", graphID)
                        .attr("class", "graph");

                    block.find(".graphZone").append(graph);

                    // Build the the graph itself
                    var trace = {
                        x: values,
                        type: "histogram",
                        opacity: 0.7,
                    };

                    Plotly.newPlot(graphID, [trace], layout, config);

                    scope.graphList.push(layout.title);
                });
            });
        }
    }
}]);
