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

angular.module("cassandre").directive("graphBlockScatter", ["$rootScope", function ($rootScope) {
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

            scope.graphtype = "scatter plots";

            // The list of graph titles
            scope.graphList = [];

            // Function to display the blocks as an accordion
            scope.display = function () {
                scope.displayedBlock = scope.displayedBlock === attrs.id ? "" : attrs.id;
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
                var xvalues = [];
                var yvalues = [];
                var labels = [];

                // Set the layout of the graph
                var layout = {
                    title: dataset,
                    xaxis: { title: scope.list[0] },
                    yaxis: { title: scope.list[1] },
                    hovermode: "closest",
                    autosize: false
                };

                // Get all the values
                scope.cells

                // Filter non-numeric values
                .filter(function (cell) {
                    return typeof cell.value === "number";
                })

                // Get the x and y values and the label of each point
                .forEach(function (cell) {
                    if (cell.set !== dataset) return;

                    var data = "";
                    var label = "";

                    // Determine what is the relevant content of the cell - Needs to be changed in the future
                    if (scope.type === $rootScope.config.rowsName.plural) {
                        data = cell.gene;
                        label = cell.exp;
                    }
                    else {
                        data = cell.exp;
                        label = cell.gene;
                    }

                    if (data === scope.list[0]) {
                        xvalues.push(cell.value);
                    }
                    else {
                        yvalues.push(cell.value);
                    }

                    labels.push(label);
                });

                // Stop here if the current dataset doesn't contain
                if (xvalues.length === 0 || yvalues.length === 0) return;

                // Set the graph identifier
                var graphID = attrs.id + Date.now();

                // Build the graph div
                var graph = angular.element("<div></div>")
                    .attr("id", graphID)
                    .attr("class", "graph");

                block.find(".graphZone").append(graph);

                // Build the the graph itself
                var trace = {
                    name: layout.title,
                    type: "scatter",
                    mode: "markers",
                    x: xvalues,
                    y: yvalues,
                    text: labels,
                    opacity: 0.7
                };

                Plotly.newPlot(graphID, [trace], layout, config);

                scope.graphList.push(layout.title);
            });
        }
    }
}]);
