/*
 * Angular resources to interact with the RESTful backend of Cassandre.
 *
 */


angular.module("cassandre")

// Resource to get the list of data sets and POST new data sets to the server
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
            method: "PUT",
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

// Resource to get the list of exp (columns) for the given data sets
.factory("expHttp", ["$resource", function expResource ($resource) {
    return $resource("/api/exp", {}, {
        get: {
            method: "GET",
            isArray: true,
            params: {
                "sets[]": "@sets"
            }
        }
    });
}])

// Resource to get the list of genes (rows) for the given data sets
.factory("genesHttp", ["$resource", function genesResource ($resource) {
    return $resource("/api/genes", {}, {
        get: {
            method: "GET",
            isArray: true,
            params: {
                "sets[]": "@sets"
            }
        }
    });
}])

// Resource to manage the general annotations
.factory("annotationsHttp", ["$resource", function annotationsResource ($resource) {
    return $resource("/api/genes/annotations", {}, {
        add: {
            method: "POST",
            transformRequest: angular.identity,     // Override Angular's default serialization
            headers: {                              // Let the browser set the Content-Type
                "Content-Type": undefined           // to fill in the boundary parameter properly
            }
        },
        remove: {
            method:"DELETE"
        }
    });
}])

// Resource to get the data stored in the database or delete some of the data sets
.factory("data", ["$resource", function dataResource ($resource) {
    return $resource("/api/data/:sets", {}, {
        get: {
            method: "GET",
            isArray: true,
            params: {
                "sets[]": "@sets",
                "exps[]": "@exps",
                "genes[]": "@genes"
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
