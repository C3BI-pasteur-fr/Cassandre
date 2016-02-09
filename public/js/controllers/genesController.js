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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

/*
 * Angular controller for the "Search Genes" section.
 *
 */

angular.module("cassandre").controller("GenesController", [ "$scope", "$filter", "genes", function ($scope, $filter, genes) {

    $scope.genes = genes.list.all();

    $scope.searchBar = {
        filter: "",
        reset: function () {
            this.filter = "";
        },
        format: {
            datasets: function (datasets) {
                return datasets.join(", ");
            },
            annotation: function (annotation) {
                if (!annotation) {
                    return "No annotation";
                }
    
                var text = "";
    
                for (var field in annotation) {
                    text = text.concat(field, " : ", annotation[field], "\n");
                }
    
                return text;
            }
        }
    };
}]);
