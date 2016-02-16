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

angular.module("cassandre").controller("MenuController", ["$scope", "$filter", "experiments", "genes", function ($scope, $filter, exps, genes) {

    // MENU
    // =====================================================================

    // Boolean to manage the display in the side menu as an accordion
    $scope.displayedList = "";

    // Handle the side menu display as an accordion
    $scope.display = function (list) {
        $scope.displayedList = $scope.displayedList !== list ? list : "";
    };

    // Select or deselect elements in the menu
    $scope.select = {
        exp: function (list, exp) {
            if ($scope.exps.list.selected.indexOf(exp) === -1) {
                exps.select.one(list, exp);
            }
            else {
                exps.deselect.one(list, exp);
            }
        },
        gene: function (list, gene) {
            if ($scope.genes.list.selected.indexOf(gene) === -1) {
                genes.select.one(list, gene);
            }
            else {
                genes.deselect.one(list, gene);
            }
        }
        //all: {
        //    genes: function () {
        //        var list = $filter("filter")($scope.genes.list.all, $scope.filter, $scope.comparator);
        //        var allSelected = list.every(function (gene) {
        //            return $scope.genes.list.selected.indexOf(gene) > -1;
        //        });
        //
        //        if (allSelected) {
        //            genes.deselect.many(list);
        //        }
        //        else {
        //            genes.select.many(list);
        //        }
        //    }
        //}
    };

    // EXPERIMENTS
    // =====================================================================

    $scope.exps = {
        list: exps.list.all(),
        removeList: function (list) {
            exps.remove.list(list);
        },
        format: function (metadata) {
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
        removeList: function (list) {
            genes.remove.list(list);
        },
        
        // Format an annotation to display it in the gene list
        format: function (annotation) {
            if (!annotation) {
                return "No annotation";
            }

            var text = "";

            for (var field in annotation) {
                text = text.concat(field, " : ", annotation[field], "\n");
            }

            return text;
        }
        //filter: "",
        //limit: 20,
        //show: {
        //    selected: false,
        //    selection: function () {
        //        this.selected = !this.selected;
        //    }
        //},
        //
        //// Special comparator to handle annotations in the genes filter
        //comparator: function (actual, expected) {
        //    if ($scope.genes.show.selected && $scope.genes.list.selected.indexOf(actual) === -1) {
        //        return false;
        //    }
        //
        //    if (!expected) {
        //        return true;
        //    }
        //
        //    var filter = expected.toLowerCase();
        //    var gene = actual.toLowerCase();
        //    var annotations = $scope.genes.list.annotations[actual] || {};
        //
        //    // Match the gene name
        //    if (gene.indexOf(filter) > -1) {
        //        return true;
        //    }
        //
        //    // Match something in the annotations
        //    for (var key in annotations) {
        //        if (annotations[key].toString().toLowerCase().indexOf(filter) > -1) {
        //            return true;
        //        }
        //    }
        //},

    };
}]);
