/*
 * Angular service to store and share the database statistics about the data sets,
 * the experiments and the genes.
 *
 */


angular.module("cassandre").factory("stats", [ "statsHttp", function statsFactory (statsHttp) {

    var stats = {
        all: {},                // Total numbers of data sets, experiments and genes
        selected: {}            // Numbers of selected data sets, experiments and genes
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
            selected: function (sets) {
                return statsHttp.get({ datasets: sets }, function (statistics) {
                    stats.selected = statistics;
                });
            }
        },
        reset: {
            selected: function () {
                stats.selected = {
                    datasets: 0,
                    exps: 0,
                    genes: 0
                };
            }
        }
    };
}]);
