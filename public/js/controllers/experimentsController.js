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
 * Angular controller for the "Search columns" section.
 *
 */

angular.module("cassandre").controller("ExperimentsController", ["$scope", "$filter", "experiments", function ($scope, $filter, exps) {

    $scope.exps = exps.list.all();

    // SEARCH BAR
    // =====================================================================

    $scope.searchBar = {
        filter: "",
        limit: 50,
        reset: function () {
            this.filter = "";
        },
        select: function () {
            var listName = this.filter;
            var expsList = Object.keys($filter("expFilter")($scope.exps.all, this.filter));

            if (expsList.length !== 0) {
                $scope.exps.sideMenu[listName] = {
                    all: expsList,
                    selected: []
                };

                // Select columns that are already selected in other lists
                expsList.forEach(function (exp) {
                    if ($scope.exps.selected.indexOf(exp) > -1) {
                        $scope.exps.sideMenu[listName].selected.push(exp);
                    }
                });
            }

            this.reset();
        }
    }

    // TYPEAHEAD
    // =====================================================================

    $scope.typeahead = {
        format: {
            datasets: function (datasets) {
                return datasets.join(", ");
            },
            metadata: function (metadata) {
                var datasets = Object.keys(metadata);
                var text = "";

                datasets.forEach(function (set) {
                    text = text.concat("Dataset ", set, " : \n");

                    if (Object.keys(metadata[set]).length > 0) {
                        for (var field in metadata[set]) {
                            text = text.concat("-- ", field, " : ", metadata[set][field], "\n");
                        }
                    }
                    else {
                        text = text.concat("-- ", "No metadata", "\n");
                    }

                    text = text.concat("\n");
                });

                return text;
            }
        }
    };
}]);
