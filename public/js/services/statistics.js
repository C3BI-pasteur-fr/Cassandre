

angular.module("cassandre").factory("statistics", [ "statisticsResource", function statisticsFactory (statisticsResource) {
    var stats = {
        all: {},
        selected: {}
    };
    
    return {
        list: {
            all: function () {
                return stats.all;
            },
            selected: function () {
                return stats.selected;
            }
        },
        get: {
            all: function () {
                return statisticsResource.get();
            },
            selected: function (list) {
                return statisticsResource.get({ datasets: list });
            }
        }
    };
}]);
