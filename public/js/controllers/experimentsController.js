/*
 * Angular controller for the "Search Experiments" section and the side menu
 * with the selected experiments lists.
 *
 */

angular.module("cassandre").controller("ExperimentsController", [ "$scope", "$filter", "experiments", function ($scope, $filter, experiments) {

    $scope.exps = {
        list: experiments.list.all(),
        filter: ""
    };

    // Select a list of experiments from the searchBar, nothing preselected by default
    $scope.selectList = function () {
        $scope.exps.list.sideMenu[$scope.exps.filter] = {
            all: $filter("filter")($scope.exps.list.all, $scope.exps.filter),
            selected: []
        };
    };

    // Reset the experiment search bar
    $scope.resetExp = function () {
        $scope.exps.filter = "";
    };
}]);
