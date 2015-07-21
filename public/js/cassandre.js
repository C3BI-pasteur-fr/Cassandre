
/*
 * Main angular module for the Cassandre front-end
 *
 */

angular.module("Cassandre", ["ngResource"])

// ----- Initialisation ------------------------------------------------- //

.run(function ($http, database) {
    $http.get("/api/measurements/list")
    .success(function (datasets) {
        database.setDatasets(datasets);
    })
    .error(function (message) {
        alert("Error : " + message);
    });
});

// ---------------------------------------------------------------------- //