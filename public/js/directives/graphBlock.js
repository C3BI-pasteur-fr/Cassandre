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

angular.module("cassandre").directive("graphBlock", ["$rootScope", function ($rootScope) {
    return {
        restrict: "E",
        templateUrl: "../../views/graphBlock.html",
        scope: {
            id: "@",
            type: "@",
            list: "=",
            cells: "=",
            displayedBlock: "="
        },
        link: function (scope, block, attrs) {
            scope.graphsNumber = scope.list.length;

            scope.display = function () {
                scope.displayedBlock = scope.displayedBlock === attrs.id ? "" : attrs.id;
            };
            
            scope.remove = function () {
                angular.element("#" + attrs.id).remove();
            };

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

            // Build each graph
            scope.list.forEach(function (element) {
                var graphID = element + "_of_" + attrs.id;

                var graph = angular.element("<div></div>")
                    .attr("id", graphID)
                    .attr("class", "graph");

                block.find(".graphZone").append(graph);

                var values = scope.cells
                .filter(function (cell) {
                    if (scope.type === $rootScope.config.rowsName.plural) {
                        return cell.gene === element;
                    }
                    else {
                        return cell.exp === element;
                    }
                })
                .map(function (cell) {
                    if (typeof cell.value === "number") {
                        return cell.value;
                    }
                });

                var trace = {
                    x: values,
                    name: element,
                    type: "histogram",
                    opacity: 0.7,
                };

                layout.title = element;

                Plotly.newPlot(graphID, [trace], layout, config);
            });
        }
    }
}]);
