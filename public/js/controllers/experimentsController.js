/*
 * Angular controller for the "Search Experiments" section and the side menu
 * with the selected experiments lists.
 *
 */

angular.module("cassandre").controller("ExperimentsController", [ "$scope", function ($scope) {
    
    // Lists of selected experiments on the side menu
    $scope.sideLists = {};
    $scope.filter = "";

    // Select a list of experiments from the searchBar
    $scope.selectList = function () {
        $scope.sideLists[$scope.filter] = $scope.filtered('exp');
    };

    // Reset the experiment search bar
    $scope.resetExp = function () {
        $scope.filter = "";
    };

    // Boolean to manage the display in the sideMenu as an accordion
    $scope.displayedList = "";

    // Handle the sideMenu display
    $scope.displayList = function (list) {
        $scope.displayedList = $scope.displayedList !== list ? list : "";
    };

    // Remove a list from the side menu
    $scope.removeList = function (list) {
        delete $scope.sideLists[list];
    }
}]);