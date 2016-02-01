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
            var expsList = $filter("filter")($scope.exps.all, this.filter);

            if (expsList.length !== 0) {
                $scope.exps.sideMenu[this.filter] = {
                    all: expsList,
                    selected: []
                };
            }

            this.reset();
        },
        format: {
            // TO PUT IN THE EXPERIMENTS SERVICE
            datasets: function (datasets) {
                return datasets.join(", ");
            },
            metadata: function (metadata) {
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
        }
    };
}]);
