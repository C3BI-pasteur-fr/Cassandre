/*
 * Angular controller for the side menu that contains the lists of
 * selected experiments.
 *
 */

angular.module("cassandre").controller("MenuController", ["$scope", "$filter", "experiments", "genes", function ($scope, $filter, experiments, genes) {

    // Lists of selected experiments on the side menu
    $scope.exps = experiments.list.all();

    // Lists of genes on the side menu
    $scope.genes = genes.list.all();

    // Boolean to manage the display in the side menu as an accordion
    $scope.displayedList = "";

    // Genes list filter
    $scope.filter =  "";

    $scope.showSelected = false;

    $scope.showSelection = function () {
        $scope.showSelected = !$scope.showSelected;
    };

    // Special comparator to handle annotations in the genes filter
    $scope.comparator = function (actual, expected) {
        if ($scope.showSelected && $scope.genes.selected.indexOf(actual) === -1) {
            return false;
        }

        if (!expected) {
            return true;
        }

        var filter = expected.toLowerCase();
        var gene = actual.toLowerCase();
        var annotations = $scope.genes.annotations[actual] || {};

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
    };

    // Genes list limit for display
    $scope.limit = 20;

    // Select or deselect elements in the side menu
    $scope.select = {
        exp: experiments.select,
        gene: function (gene) {
            if ($scope.genes.selected.indexOf(gene) === -1) {
                genes.select.one(gene);
            }
            else {
                genes.deselect.one(gene);
            }
        },
        all: {
            genes: function () {
                var list = $filter("filter")($scope.genes.all, $scope.filter, $scope.comparator);
                var allSelected = list.every(function (gene) {
                    return $scope.genes.selected.indexOf(gene) > -1;
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


    // Handle the side menu display
    $scope.display = function (list) {
        $scope.displayedList = $scope.displayedList !== list ? list : "";
    };

    // Remove a list from the side menu
    $scope.removeList = function (list) {
        delete $scope.exps.sideMenu[list];
    };

    // Format an annotation to display in the genes list
    $scope.annotation = function (gene) {
        var annotation = $scope.genes.annotations[gene];
        var text = "";

        for (var field in annotation) {
            text = text.concat(field, " : ", annotation[field], "\n");
        }

        return text;
    }
}]);
