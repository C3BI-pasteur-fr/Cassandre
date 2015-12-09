/*
 * Angular controller for the side menu that contains the lists of
 * selected experiments.
 *
 */

angular.module("cassandre").controller("MenuController", ["$scope", "experiments", "genes", function ($scope, experiments, genes) {

    // Lists of selected experiments on the side menu
    $scope.exps = experiments.list.all();

    // Lists of genes on the side menu
    $scope.genes = genes.list.all();

    // Boolean to manage the display in the side menu as an accordion
    $scope.displayedList = "";

    // Select or deselect an element in the side menu
    $scope.select = {
        exp: experiments.select,
        gene: genes.select
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
    $scope.format = function (annotation) {
        var text = "";

        for (var field in annotation) {
            text = text.concat(field, " : ", annotation[field], "\n");
        }

        return text;
    }
}]);
