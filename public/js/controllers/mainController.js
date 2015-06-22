
/*
 * Main controller of Cassandre for the display section.
 *
 */

angular.module("Cassandre").controller("mainController", [
    "$scope", "$filter", "$http", function ($scope, $filter, $http) {

    $scope.data = [
        {one: "tata", two: "titi", three: "toto", four: "tutu"},
        {one: "toto", two: "toto", three: "titi", four: "tutu"},
        {one: "toto", two: "tutu", three: "tata", four: "titi"}
    ];

    $scope.measurementID = "";
    $scope.experimentID = "";
    $scope.geneID = "";
    $scope.dataID = "";

    $scope.predicate = "";
    $scope.reverse = false;

    // Ordering function
    $scope.order = function (header, reverse) {
        $scope.predicate = header;
        $scope.reverse = reverse;
        $scope.data = $filter("orderBy")($scope.data, $scope.predicate, $scope.reverse);
    };

    // Reset the form properly
    $scope.reset = function () {
        $scope.measurementID = "";
        $scope.expID = "";
        $scope.geneID = "";
        $scope.dataID = "";
    };

    // Request to the database
    $scope.getData = function () {
        var url = "/api/measurement/";

        if ($scope.dataID === "expID") {
            url = url.concat($scope.measurementID, "/exp/", scope.expID);
        }
        else if ($scope.dataID === "geneID") {
            url = url.concat($scope.measurementID, "/gene/", scope.geneID);
        }
        else {
            alert("You need to choose experiment ID or gene ID.");
            return;
        }

        $http.get(url)
        .success(function (data) {
            alert(data);
            $scope.data = data;
        })
        .error(function (error) {
            alert("There was an error : " + error);
        });
    };
}]);