

angular.module("Cassandre").factory("database", ["$rootScope", function databaseFactory ($rootScope) {
    var data = {
        datasets: ["haha"]
    };
    
    return {
        getDatasets: function () {
            return data.datasets;
        },
        setDatasets: function (datasets) {
            data.datasets = datasets;
            $rootScope.$broadcast("dataUpdate");
        }
    }
}]);