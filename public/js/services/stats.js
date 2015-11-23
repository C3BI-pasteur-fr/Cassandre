/*
 * Angular service to store and share the database statistics about the datasets,
 * the experiments and the genes.
 *
 */


angular.module("cassandre").factory("stats", [ "statsHttp", "datasets", function statsFactory (statsHttp, datasets) {

    var stats = {
        all: {},                // Total numbers of datasets, experiments and genes
        selected: {}            // Numbers of selected datasets, experiments and genes
    };

    return {
        list:function () {
            return stats;
        },
        get: {
            all: function () {
                return statsHttp.get(function (statistics) {
                    stats.all = statistics;
                });
            },
            selected: function () {
                return statsHttp.get({ datasets: datasets.list.selected() }, function (statistics) {
                    stats.selected = statistics;
                });
            }
        }
    };
}]);
