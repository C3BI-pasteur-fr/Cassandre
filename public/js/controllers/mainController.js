
/*
 * Main controller of Cassandre for the display section.
 *
 */

angular.module("Cassandre").controller("mainController", [
    "$scope", "$filter", "$http", "xlsxToJson", "tsvToJson",
    function ($scope, $filter, $http, xlsxToJson, tsvToJson) {

    $scope.data = [];               // Data to display
    $scope.dataFile = [];           // Content of the uploaded File
    $scope.isLoading = false;       // Marker to know when data are loading
    $scope.isUploading = false;     // Marker to know when data are uploading
    $scope.allowedTypes = {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        txt: "text/plain",
        tsv: "text/tab-separated-values"
    };

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

    // Reset the query form properly
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

    // Reset the query form properly
    $scope.resetUpload = function () {
        document.getElementById("uploadForm").reset();
    };

    // Parse the dataFile depending on its type
    $scope.parseFile = function () {
        var file = document.getElementById("dataFile").files[0];

        if (file.type === $scope.allowedTypes["xlsx"]) {
            xlsxToJson(file, function (err, json) {
                $scope.dataFile = json;
                $scope.$digest();
            });
        }

        else if (file.type === $scope.allowedTypes["tsv"] || file.type === $scope.allowedTypes["txt"]) {
            tsvToJson(file, function (err, json) {
                $scope.dataFile = json;
                $scope.$digest();
            });
        }
        
        else {
            alert("This file format is invalide.");
        }
    };
    
    $scope.sendData = function () {
        $scope.isUploading = true;
        
        $http.post("/api/measurements", $scope.dataFile)
        .success(function (message) {
            alert(message);
            $scope.isUploading = false;
        })
        .error(function (message) {
            alert(message);
            $scope.isUploading = false;
        });
    }
}]);