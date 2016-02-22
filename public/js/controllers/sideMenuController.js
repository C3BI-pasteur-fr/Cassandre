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
 * Angular controller for the side menu that contains the lists of
 * selected experiments.
 *
 */

angular.module("cassandre").controller("SideMenuController", ["$scope", "experiments", "genes", function ($scope, exps, genes) {

    // MENU
    // =====================================================================

    // Boolean to manage the display in the side menu as an accordion
    $scope.displayedList = "";

    // Handle the side menu display as an accordion
    // Add the section name to avoid conflicts with list names
    $scope.display = function (list, section) {
        var name = list + section;
        $scope.displayedList = $scope.displayedList !== name ? name : "";
    };

    // EXPERIMENTS
    // =====================================================================

    $scope.exps = {
        list: exps.list.all(),
        removeList: exps.remove.list,

        // Select or deselect elements in the list
        select: {
            one: function (exp) {
                if ($scope.exps.list.selected.indexOf(exp) === -1) {
                    exps.select.one(exp);
                }
                else {
                    exps.deselect.one(exp);
                }
            },
            all: function (listName) {
                var list = $scope.exps.list.sideMenu[listName];

                if (list.all.length === list.selected.length) {
                    exps.deselect.many(list.all);
                }
                else {
                    exps.select.many(list.all);
                }
            }
        },

        // Format the metadata for the display in the title tag
        metadataOf: function (exp) {
            var metadata = this.list.all[exp].metadata;
            var datasets = Object.keys(metadata);
            var text = "";

            datasets.forEach(function (set) {
                text = text.concat("Dataset ", set, " : \n");

                if (metadata[set]) {
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
    };

    // GENES
    // =====================================================================

    $scope.genes = {
        list: genes.list.all(),
        removeList: genes.remove.list,

        // Select or deselect elements in the list
        select: {
            one: function (gene) {
                if ($scope.genes.list.selected.indexOf(gene) === -1) {
                    genes.select.one(gene);
                }
                else {
                    genes.deselect.one(gene);
                }
            },
            all: function (listName) {
                var list = $scope.genes.list.sideMenu[listName];

                if (list.all.length === list.selected.length) {
                    genes.deselect.many(list.all);
                }
                else {
                    genes.select.many(list.all);
                }
            }
        },

        // Format the annotation for the display in the title tag
        annotationOf: function (gene) {
            var annotation = this.list.all[gene].annotation;

            if (!annotation) {
                return "No annotation";
            }

            var text = "";

            for (var field in annotation) {
                text = text.concat(field, " : ", annotation[field], "\n");
            }

            return text;
        }
    };
}]);
