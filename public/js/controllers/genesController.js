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
 * Angular controller for the "Search Genes" section.
 *
 */

angular.module("cassandre").controller("GenesController", [ "$scope", "$filter", "genes", function ($scope, $filter, genes) {

    $scope.genes = genes.list.all();

    // SEARCH BAR
    // =====================================================================

    $scope.searchBar = {
        filter: "",
        limit: 50,
        reset: function () {
            this.filter = "";
        },
        select: function () {
            var geneList = Object.keys($filter("geneFilter")($scope.genes.all, this.filter));

            if (geneList.length > 0) {
                $scope.genes.sideMenu[this.filter] = {
                    all: geneList,
                    selected: []
                };
            }

            this.reset();
        }
    };

    // HELPERS
    // =====================================================================

    // Check if the gene has annotations
    $scope.hasAnnotations = function (gene) {
        if (Object.keys(gene.annotation).length > 0) {
            return true;
        }
        else {
            return false;
        }
    };

    // Format the list of datasets properly
    $scope.datasetsOf = function (gene) {
        if (gene.datasets.length === 0) {
            return "Does not appear in any dataset.";
        }

        var text = "This gene appears in:\n";

        gene.datasets.forEach(function (set, index, datasets) {
            text = text.concat(set, "\n");
        });

        return text;
    };
}]);
