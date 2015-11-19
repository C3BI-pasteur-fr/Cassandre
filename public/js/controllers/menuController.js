/*
 * Angular controller for the side menu that contains the lists of
 * selected experiments.
 *
 */

angular.module("cassandre").controller("MenuController", ["$scope", "experiments", function ($scope, experiments) {

    // Lists of selected experiments on the side menu
    $scope.exp = experiments.list();

    // Boolean to manage the display in the side menu as an accordion
    $scope.displayedList = "";

    // Handle the side menu display
    $scope.display = function (list) {
        $scope.displayedList = $scope.displayedList !== list ? list : "";
    };

    // Remove a list from the side menu
    $scope.removeList = function (list) {
        delete $scope.exp.sideMenu[list];
    };

}]);