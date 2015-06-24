
/*
 * Main controller of Cassandre for the display section.
 *
 */

angular.module("Cassandre").controller("mainController", [
    "$scope", "$filter", "$http", function ($scope, $filter, $http) {

    $scope.data = [];           // Data to display
    $scope.isLoading = false;   // Marker to know when data are loading

    $scope.measID = "";
    $scope.expID = "";
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
        $scope.measID = "";
        $scope.expID = "";
        $scope.geneID = "";
        $scope.dataID = "";
    };

    // Request to the database
    $scope.getData = function () {
        var url = "/api/measurements/";

        // Build the URL if needed
        if ($scope.measID === "") {
            url = url.concat("list/");
        }
        else if ($scope.dataID === "expID" && $scope.measID !== "") {
            url = url.concat(encodeURIComponent($scope.measID), "/exp/");
            
            if ($scope.expID !== "") {
                url = url.concat(encodeURIComponent($scope.expID));
            }
            else {
                url = url.concat("list/");
            }
        }
        else if ($scope.dataID === "geneID" && $scope.measID !== "") {
            url = url.concat(encodeURIComponent($scope.measID), "/gene/");
            
            if ($scope.geneID !== "") {
                url = url.concat(encodeURIComponent($scope.geneID));
            }
            else {
                url = url.concat("list/");
            }
        }
        else if ($scope.dataID === "" && $scope.measID !== "") {
            alert("Please select experiment or gene ID.");
            return;
        }
        
        $scope.isLoading = true;

        $http.get(url)
        .success(function (data) {
            $scope.data = data;
            $scope.isLoading = false;
        })
        .error(function (error) {
            $scope.isLoading = false;
            alert("There was an error : " + error);
        });
    };
}]);