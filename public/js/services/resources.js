/*
 * Angular resources to interact with the RESTful backend of Cassandre.
 *
 */

angular.module("cassandre")

// Resource to get the list of datasets and POST new datasets to the server
.factory("datasetsHttp", ["$resource", "$filter", function datasetsResource ($resource, $filter) {
    return $resource("/api/datasets", {}, {
        get: {
            method: "GET",
            isArray: true
        },
        add: {
            method: "POST",
            transformRequest: angular.identity,     // Override Angular's default serialization
            headers: {                              // Let the browser set the Content-Type
                "Content-Type": undefined           // to fill in the boundary parameter properly
            }
        },
        update: {
            method: "PATCH",
            params: {
                id: "@id"
            }
        },
        remove: {
            method: "DELETE",
            params: {
                name: "@name"
            }
        }
    });
}])

// Resource to manage the general annotations
.factory("annotations", ["$resource", function annotationsResource ($resource) {
    return $resource("/api/annotations", {}, {
        get: {
            method: "GET",
            isArray: true
        },
        add: {
            method: "POST",
            transformRequest: angular.identity,     // Override Angular's default serialization
            headers: {                              // Let the browser set the Content-Type
                "Content-Type": undefined           // to fill in the boundary parameter properly
            }
        }
    });
}])

// Resource to get the list of exp (columns) for the given datasets
.factory("expHttp", ["$resource", function expResource ($resource) {
    return $resource("/api/measurements/exp", {}, {
        get: {
            method: "GET",
            isArray: true,
            params: {
                "mId[]": "@mId"
            }
        }
    });
}])

// Resource to get the list of genes (rows) for the given datasets
.factory("genes", ["$resource", function genesResource ($resource) {
    return $resource("/api/measurements/:mId/genes", {}, {
        list: {
            method: "GET",
            isArray: true,
            params: {
                "mId[]": "@mId"
            }
        }
    });
}])

// Resource to get the data stored in the database or delete some of the datasets
.factory("data", ["$resource", function dataResource ($resource) {
    return $resource("/api/measurements/:mId", {}, {
        get: {
            method: "GET",
            isArray: true,
            params: {
                "mId[]": "@mId",
                "expId[]": "@expId",
                "geneId[]": "@geneId"
            }
        }
    });
}])

// Resource to get statistics from the database
.factory("statistics", ["$resource", function statisticsResource ($resource) {
    return $resource("/api/statistics", {}, {
        get: {
            method: "GET",
            params: {
                "datasets[]": "@datasets"
            }
        }
    });
}]);
