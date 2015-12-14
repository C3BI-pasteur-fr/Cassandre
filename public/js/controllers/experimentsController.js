/*
 * Angular controller for the "Search Experiments" section and the side menu
 * with the selected experiments lists.
 *
 */

angular.module("cassandre").controller("ExperimentsController", [ "$scope", "$filter", "experiments", function ($scope, $filter, experiments) {

    $scope.exps = experiments.list.all();

    $scope.searchBar = {
        filter: "",
        reset: function () {
            this.filter = "";
        },
        select: function () {
            var expsList = $filter("filter")($scope.exps.list.all, this.filter);

            if (expsList.length !== 0) {
                $scope.exps.list.sideMenu[this.filter] = {
                    all: expsList,
                    selected: []
                };
            }

            this.reset();
        }
    };
}]);
