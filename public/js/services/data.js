
angular.module("Cassandre").factory("geneData", ["$resource", function geneDataFactory ($resource) {
    return $resource("/api/measurements/:mId/gene/list/");
}]);

angular.module("Cassandre").factory("expData", ["$resource", function expDataFactory ($resource) {
    return $resource("/api/measurements/:mId/exp/list/");
}]);

angular.module("Cassandre").factory("dataValues", ["$resource", function dataValuesFactory ($resource) {
    return $resource("/api/measurements/:mId/exp/:geneID/");
}]);