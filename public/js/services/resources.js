/*
 * Angular resources to interact with the RESTful backend of Cassandre.
 *
 */

angular.module("Cassandre")

// Resource to get the list of datasets and POST new datasets to the server
.factory("datasets", ["$resource", function datasetsFactory ($resource) {
    return $resource("/api/measurements", {}, {
        list: {
            method: "GET",
            isArray: true
        },
        create: {
            method: "POST",
            transformRequest: angular.identity,     // Override Angular's default serialization
            headers: {                              // Let the browser set the Content-Type
                "Content-Type": undefined           // to fill in the boundary parameter properly
            }
        },
        update: {
            method: "PUT",
            params: {
                id: "@id",
                newName: "@newName",
                newDescription : "@newDescription"
            }
        },
        hide: {
            method: "PUT",
            params: {
                id: "@id",
                hidden: true
            }
        },
        show: {
            method: "PUT",
            params: {
                id: "@id",
                hidden: false
            }
        }
    });
}])

// Resource to manage the general metadata
.factory("metadata", ["$resource", function metadataFactory ($resource) {
    return $resource("/api/metadata", {}, {
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
.factory("exp", ["$resource", function expFactory ($resource) {
    return $resource("/api/measurements/:mId/exp", {}, {
        list: {
            method: "GET",
            isArray: true,
            params: {
                "mId[]": "@mId"
            }
        }
    });
}])

// Resource to get the list of genes (rows) for the given datasets
.factory("genes", ["$resource", function geneFactory ($resource) {
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
.factory("data", ["$resource", function dataFactory ($resource) {
    return $resource("/api/measurements/:mId", {}, {
        get: {
            method: "GET",
            isArray: true,
            params: {
                "mId[]": "@mId",
                "expId[]": "@expId",
                "geneId[]": "@geneId"
            }
        },
        remove: {
            method: "DELETE",
            params: {
                "mId[]": "@mId"
            }
        }
    });
}]);
