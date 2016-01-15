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
        gene: function (gene) {
            if ($scope.genes.list.selected.indexOf(gene) === -1) {
                genes.select.one(gene);
            }
            else {
                genes.deselect.one(gene);
            }
        },
        all: {
            genes: function () {
                var list = $filter("filter")($scope.genes.list.all, $scope.filter, $scope.comparator);
                var allSelected = list.every(function (gene) {
                    return $scope.genes.list.selected.indexOf(gene) > -1;
                });

                if (allSelected) {
                    genes.deselect.many(list);
                }
                else {
                    genes.select.many(list);
                }
            }
        }
    };

    // EXPERIMENTS
    // =====================================================================

    $scope.exps = {
        list: exps.list.all(),
        removeList: function (list) {
            exps.remove.list(list);
        }
    };

    // GENES
    // =====================================================================

    $scope.genes = {
        list: genes.list.all(),
        filter: "",
        limit: 20,
        show: {
            selected: false,
            selection: function () {
                this.selected = !this.selected;
            }
        },

        // Special comparator to handle annotations in the genes filter
        comparator: function (actual, expected) {
            if ($scope.genes.show.selected && $scope.genes.list.selected.indexOf(actual) === -1) {
                return false;
            }

            if (!expected) {
                return true;
            }

            var filter = expected.toLowerCase();
            var gene = actual.toLowerCase();
            var annotations = $scope.genes.list.annotations[actual] || {};

            // Match the gene name
            if (gene.indexOf(filter) > -1) {
                return true;
            }

            // Match something in the annotations
            for (var key in annotations) {
                if (annotations[key].toString().toLowerCase().indexOf(filter) > -1) {
                    return true;
                }
            }
        },

        // Format an annotation to display in the genes list
        annotation: function (gene) {
            var annotation = this.list.annotations[gene];
            var text = "";

            for (var field in annotation) {
                text = text.concat(field, " : ", annotation[field], "\n");
            }

            return text;
        }
    };
}]);
