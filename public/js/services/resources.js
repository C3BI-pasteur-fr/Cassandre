/*
 * Angular resources to interact with the RESTful backend of Cassandre.
 *
 */

angular.module("Cassandre")

// Resource to get the list of datasets and POST new datasets to the server
.factory("datasets", ["$resource", function datasetsFactory ($resource) {
    return $resource("/api/measurements/");
}])

// Resource to get the list of exp (columns) for the given datasets
.factory("expList", ["$resource", function expListFactory ($resource) {
    return $resource("/api/measurements/:mId/exp/", {}, {
        get: {
            method: "GET",
            params: { "mId[]": "@mId"}
        }
    });
}])

// Resource to get the list of genes (rows) for the given datasets
.factory("genesList", ["$resource", function geneListFactory ($resource) {
    return $resource("/api/measurements/:mId/genes/", {}, {
        get: {
            method: "GET",
            params: { "mId[]": "@mId"}
        }
    });
}])

// Resource to get the data stored in the database or delete some of the datasets
.factory("data", ["$resource", function dataFactory ($resource) {
    return $resource("/api/measurements/:mId", {}, {
        get: {
            method: "GET",
            params: { "mId[]": "@mId", "expId[]": "@expId", "geneId[]": "@geneId"}
        },
        remove: {
            method: "DELETE",
            params: { "mId[]": "@mId" }
        }
    });
}]);
