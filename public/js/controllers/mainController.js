
/*
 * Main controller of Cassandre for the display section.
 *
 */

angular.module("Cassandre").controller("mainController", [
    "$scope", "$filter", "$http", "xlsxToJson", "tsvToJson", "database", "measData", "geneData", "expData", "dataValues",
    function ($scope, $filter, $http, xlsxToJson, tsvToJson, database, measData, geneData, expData, dataValues) {

    $scope.data = [];                   // Data to display
    $scope.dataRows = {};               // Date formatted by rows
    $scope.dataFile = [];               // Content of the uploaded File
    $scope.datasets = measData.query(); // Names of the differents database sets
    $scope.isLoading = false;           // Marker to know when data are loading
    $scope.isUploading = false;         // Marker to know when data are uploading
    $scope.allowedTypes = {             // Allowed MIME types for the uploaded files
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        txt: "text/plain",
        tsv: "text/tab-separated-values"
    };

    $scope.$on("dataUpdate", function () {
        $scope.datasets = database.getDatasets();
    });

    // Used for ordering the results
    $scope.predicate = "";
    $scope.reverse = false;

    // Contains the selected datasets for the db request
    $scope.selectedDatasets = [];
    $scope.selectedGenes = [];
    $scope.selectedExp = [];
    
    // Lists from the request
    $scope.geneList = [];
    $scope.expList = [];
    $scope.selectedGene = "";
    
    // Filters
    $scope.datasetFilter = "";
    $scope.expFilter = "";
    $scope.geneFilter = "";
    
    // Functions to select dataset, exp or gene
    $scope.selectDataset = function (dataset) {
        var index = $scope.selectedDatasets.indexOf(dataset);
        
        if ( index > -1) {
            $scope.selectedDatasets.splice(index, 1);
        }
        else {
            $scope.selectedDatasets.push(dataset);
        }
    };

    $scope.selectExp = function (exp) {
        var index = $scope.selectedExp.indexOf(exp);
        
        if ( index > -1) {
            $scope.selectedExp.splice(index, 1);
        }
        else {
            $scope.selectedExp.push(exp);
        }
    };
    
    $scope.selectGene = function (gene) {
        var index = $scope.selectedGenes.indexOf(gene);
        
        if ( index > -1) {
            $scope.selectedGenes.splice(index, 1);
        }
        else {
            $scope.selectedGenes.push(gene);
        }
    };

    // Get the lists for the given datasets
    $scope.searchData = function () {
        $scope.geneList = geneData.query({
            mId: encodeURIComponent($scope.selectedDatasets)
        });

        $scope.expList = expData.query({
            mId: encodeURIComponent($scope.selectedDatasets)
        });
    };

    // Get the data for the selected genes and/or exp (for only on measurement currently)
    $scope.getData = function () {
        $scope.data = dataValues.query({
            mId: encodeURIComponent(Object.keys($scope.selectedDatasets)[0]),
            expId: $scope.selectedExp,
            geneId: $scope.selectedGenes
        }, function(data) {
            
            // Format data into rows to ease the display in the view
            data.forEach(function (cell) {
                var gene = cell.geneId;
                $scope.dataRows[gene] = {};
                data.forEach(function (cell) {
                    $scope.dataRows[gene][cell.expId] = cell.value;
                });
            });
        });
    };

    // Ordering function
    $scope.order = function (header, reverse) {
        $scope.predicate = header;
        $scope.reverse = reverse;
        $scope.data = $filter("orderBy")($scope.data, $scope.predicate, $scope.reverse);
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

    // Display a part of the file in the results section
    $scope.displayFile = function () {
        $scope.data = $scope.dataFile.slice(0, 49);
    };

    // Send the files to the server using a FormData
    $scope.sendData = function () {
        var allData = new FormData();

        allData.append("dataFile", document.getElementById("dataFile").files[0]);

        $scope.isUploading = true;

        $http.post("/api/measurements", allData, {
            transformRequest: angular.identity,     // Override Angular's default serialization
            headers: {                              // Let the browser set the Content-Type
                "Content-Type": undefined           // to fill in the boundary parameter properly
            }
        })
        .success(function (message) {
            $scope.isUploading = false;
            alert(message);
            
        })
        .error(function (message) {
            $scope.isUploading = false;
            alert("Error : " + message);
        });
    }
}]);