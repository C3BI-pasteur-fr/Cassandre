
angular.module("Cassandre").factory("measData", ["$resource", function measDataFactory ($resource) {
    return $resource("/api/measurements/list/");
}]);

angular.module("Cassandre").factory("geneData", ["$resource", function geneDataFactory ($resource) {
    return $resource("/api/measurements/:mId/gene/list/", {}, {
        get: { params: { "mId[]": "@mId"} }
    });
}]);

angular.module("Cassandre").factory("expData", ["$resource", function expDataFactory ($resource) {
    return $resource("/api/measurements/:mId/exp/list/", {}, {
        get: { params: { "mId[]": "@mId"} }
    });
}]);

angular.module("Cassandre").factory("dataValues", ["$resource", function dataValuesFactory ($resource) {
    return $resource("/api/measurements/:mId/", {}, {
        get: { params: { "expId[]": "@expId", "geneId[]": "@geneId"} }
    });
}]);
