/*
 * Angular resources to interact with the RESTful backend of Cassandre.
 *
 */


angular.module("cassandre")

// Resource to get the list of datasets and POST new datasets to the server
.factory("datasetsHttp", ["$resource", function datasetsResource ($resource) {
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
.factory("annotationsHttp", ["$resource", function annotationsResource ($resource) {
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
                "sets[]": "@sets"
            }
        }
    });
}])

// Resource to get the list of genes (rows) for the given datasets
.factory("genesHttp", ["$resource", function genesResource ($resource) {
    return $resource("/api/measurements/genes", {}, {
        get: {
            method: "GET",
            isArray: true,
            params: {
                "sets[]": "@sets"
            }
        }
    });
}])

// Resource to get the data stored in the database or delete some of the datasets
.factory("data", ["$resource", function dataResource ($resource) {
    return $resource("/api/measurements/:sets", {}, {
        get: {
            method: "GET",
            isArray: true,
            params: {
                "sets[]": "@sets",
                "expId[]": "@expId",
                "geneId[]": "@geneId"
            }
        }
    });
}])

// Resource to get statistics from the database
.factory("statsHttp", ["$resource", function statsResource ($resource) {
    return $resource("/api/stats", {}, {
        get: {
            method: "GET",
            params: {
                "datasets[]": "@datasets"
            }
        }
    });
}]);
