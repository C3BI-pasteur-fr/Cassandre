/*
 * Angular controller for the side menu that contains the lists of
 * selected experiments.
 *
 */

angular.module("cassandre").controller("MenuController", ["$scope", "experiments", "genes", function ($scope, experiments, genes) {

    // Lists of selected experiments on the side menu
    $scope.exps = experiments.list();
    
    // Lists of genes on the side menu
    $scope.genes = genes.list();
    
    // Select or deselect an element in the side menu
    $scope.select = {
        exp: function (list, exp) {
            if ($scope.exps.selected.indexOf(exp) === -1) {
                $scope.exps.selected.push(exp);
                $scope.exps.sideMenu[list].selected.push(exp);
            }
            else {
                $scope.exps.selected.splice($scope.exps.selected.indexOf(exp), 1);
                $scope.exps.sideMenu[list].selected.splice($scope.exps.sideMenu[list].selected.indexOf(exp), 1);
            }
        },
        gene: function (gene) {
            if ($scope.genes.selected.indexOf(gene) === -1) {
                $scope.genes.selected.push(gene);
            }
            else {
                $scope.genes.selected.splice($scope.genes.selected.indexOf(gene), 1)
            }
        }
    };

    // Boolean to manage the display in the side menu as an accordion
    $scope.displayedList = "";

    // Handle the side menu display
    $scope.display = function (list) {
        $scope.displayedList = $scope.displayedList !== list ? list : "";
    };

    // Remove a list from the side menu
    $scope.removeList = function (list) {
        delete $scope.exps.sideMenu[list];
    };
}]);
