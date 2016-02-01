/*
 * Angular controller for the "Search Genes" section.
 *
 */

angular.module("cassandre").controller("GenesController", [ "$scope", "$filter", "genes", function ($scope, $filter, genes) {

    $scope.genes = genes.list.all();

    $scope.searchBar = {
        filter: "",
        reset: function () {
            this.filter = "";
        },
        format: {
            datasets: function (datasets) {
                return datasets.join(", ");
            },
            annotation: function (annotation) {
                if (!annotation) {
                    return "No annotation";
                }
    
                var text = "";
    
                for (var field in annotation) {
                    text = text.concat(field, " : ", annotation[field], "\n");
                }
    
                return text;
            }
        }
    };
}]);
