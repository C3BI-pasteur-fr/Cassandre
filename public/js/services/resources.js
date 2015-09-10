
angular.module("Cassandre").factory("datasets", ["$resource", function datasetsFactory ($resource) {
    return $resource("/api/measurements/");
}]);

angular.module("Cassandre").factory("expList", ["$resource", function expListFactory ($resource) {
    return $resource("/api/measurements/:mId/exp/", {}, {
        get: { params: { "mId[]": "@mId"} }
    });
}]);

angular.module("Cassandre").factory("genesList", ["$resource", function geneListFactory ($resource) {
    return $resource("/api/measurements/:mId/genes/", {}, {
        get: { params: { "mId[]": "@mId"} }
    });
}]);

angular.module("Cassandre").factory("data", ["$resource", function dataFactory ($resource) {
    return $resource("/api/measurements/:mId", {}, {
        get: { params: { "mId[]": "@mId", "expId[]": "@expId", "geneId[]": "@geneId"} },
        delete: { params: { "mId[]": "@mId" } }
    });
}]);
