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

angular.module("cassandre").directive("graphBlock", function () {
    return {
        restrict: "E",
        templateUrl: "../../views/graphBlock.html",
        link: function (scope, element, attrs) {
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
            scope.genes.selected.forEach(function (gene) {
                var graphID = gene + "_of_" + attrs.id;

                var geneGraph = angular.element("<div></div>")
                    .attr("id", graphID)
                    .attr("class", "graph");

                element.append(geneGraph);

                var values = scope.data.cells
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

                Plotly.newPlot(graphID, [trace], layout, config);
            });
        }
    }
});
