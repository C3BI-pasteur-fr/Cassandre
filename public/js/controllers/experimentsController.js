/*
 * Angular controller for the "Search Experiments" section and the side menu
 * with the selected experiments lists.
 *
 */

angular.module("cassandre").controller("ExperimentsController", [ "$scope", "$filter", "experiments", function ($scope, $filter, experiments) {

    $scope.exp = {
        list: experiments.list(),
        filter: ""
    };

    // Select a list of experiments from the searchBar, nothing preselected by default
    $scope.selectList = function () {
        $scope.exp.list.sideMenu[$scope.exp.filter] = {
            all: $filter("filter")($scope.exp.list.all, $scope.exp.filter),
            selected: []
        };
    };

    // Reset the experiment search bar
    $scope.resetExp = function () {
        $scope.exp.filter = "";
    };
}]);
