
/*
 * Main controller of Cassandre for the display section.
 *
 */

angular.module("Cassandre").controller("mainController", [
    "$scope", "$filter", "$http", "xlsxToJson", "tsvToJson", "jsonToTsv", "datasets", "genes", "exp", "data", "annotations",
    function ($scope, $filter, $http, xlsxToJson, tsvToJson, jsonToTsv, datasets, genes, exp, data, annotations) {

    $scope.dataCells = [];              // Data from database
    $scope.dataRows = [];               // Data formatted in rows
    $scope.dataHref = "#";              // Data URI of the display table for the download
    $scope.isLoading = false;           // Marker to know when data are loading
    $scope.dataIsUploading = false;     // Marker to know when data are uploading
    $scope.annotIsUploading = false;    // Marker to know when annotations are uploading
    $scope.allowedTypes = {             // Allowed MIME types for the uploaded files
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        txt: "text/plain",
        tsv: "text/tab-separated-values"
    };

    // Booleans to control the display
    $scope.showDatasetsSection = false;
    $scope.showAnnotationsSection = false;

    // File to upload
    $scope.dataFile = {
        content: "",        // The File Object
        newName: "",        // The name modified by the user
        description: ""     // A description of the dataset
    };

    // Annotations File
    $scope.annotFile = {
        content: ""
    };

    // When making changes to a dataset
    $scope.datasetChanges = {
        id: "",
        name: "",
        description : ""
    };

    // Used for ordering the results and mark the columns
    $scope.predicate = "";
    $scope.reverse = false;

    // Marker for the datasets menu
    $scope.showHiddenDatasets = false;

    // Lists in the selection menu
    $scope.lists = {
        datasets: datasets.list(),  // The list is an object with names as keys
        genes: [],
        exp: []
    };

    // Contains the menu rows selected by the user
    $scope.selected = {
        datasets: [],
        genes: [],
        exp: []
    };

    // Filter bars in the menu
    $scope.filters = {
        datasets: "",
        genes: "",
        exp: ""
    };

    // Limits for display
    $scope.limits = {
        datasets: 10,
        genes: 10,
        exp: 10,
        results: 10
    };

    // Options for the limit dropdowns
    $scope.limitsOptions = {
        "10": 10,
        "20": 20,
        "50": 50,
        "100": 100,
        "No Limit": undefined
    };

    // Return the filtered lists that appear in the menus
    $scope.filtered = function (list, showHidden) {
        var filteredList = $scope.lists[list];

        // Special filtering for datasets only
        if (list === "datasets" && !showHidden) {
            filteredList = filteredList.filter(function (element) {
                return !element.hidden;
            });
        }

        filteredList = $filter("filter")(filteredList, $scope.filters[list]);
        filteredList = $filter("limitTo")(filteredList, $scope.limits[list]);

        return filteredList;
    };

    // Function to select dataset, exp or gene
    $scope.select = function (list, element) {
        var index = $scope.selected[list].indexOf(element);

        if ( index > -1) {
            $scope.selected[list].splice(index, 1);
        }

        else {
            $scope.selected[list].push(element);
        }
    };

    // Function to check/uncheck all
    $scope.selectAll = function (list) {
        if ($scope.selected[list].length !== $scope.filtered(list).length) {

            // Map to handle the fact that datasets are objects
            $scope.selected[list] = $scope.filtered(list).map(function (element) {
                return typeof(element) === "object" ? element.name : element;
            });
        }

        else {
            $scope.selected[list] = [];
        }
    }

    // Get the lists for the given datasets
    $scope.searchData = function () {
        $scope.lists.exp = exp.list({
            mId: encodeURIComponent($scope.selected.datasets)
        });

        $scope.lists.genes = genes.list({
            mId: encodeURIComponent($scope.selected.datasets)
        });
    };

    // Get the data for the selected genes and/or exp
    $scope.getData = function () {
        $scope.dataCells = data.get({
            mId: encodeURIComponent($scope.selected.datasets),
            expId: $scope.selected.exp,
            geneId: $scope.selected.genes
        }, function (data) {
            $scope.cellsToRows(data, "expId", "geneId", "value");
        });
    };

    // Get all annotations
    $scope.getAnnotations = function () {
        $scope.dataCells = annotations.get({}, function (data) {
            $scope.cellsToRows(data, "column", "row", "value");
        });
    };

    // Format data into rows to ease the display in the view
    $scope.cellsToRows = function(data, colName, rowName, valueName) {
        $scope.dataRows = [];
        var headers = [];
        var rows = {};

        // List the headers
        data.forEach(function (cell) {
            if (headers.indexOf(cell[colName]) === -1) {
                headers.push(cell[colName]);
            }
        });

        // Build the rows
        data.forEach(function (cell) {

            // Add the row if not yet present
            if (!rows[cell[rowName]]) {
                rows[cell[rowName]] = {};
                headers.forEach(function (header) {
                    rows[cell[rowName]][header] = null;
                });
            }

            // Add the value at the right place
            rows[cell[rowName]][cell[colName]] = cell[valueName];
        });

        // Then format rows in an array of objects with headers as keys
        for (var rowName in rows) {
            var newRow = { "ID": rowName };

            for (var header in rows[rowName]) {
                newRow[header] = rows[rowName][header];
            };

            $scope.dataRows.push(newRow);
        }
    };

    // Hide a dataset in the menu
    $scope.hide = function (id) {
        datasets.hide({
            id: encodeURIComponent(id)
        }, {
            hidden: true
        }, function () {
            // TO CHANGE
            $scope.lists.datasets = datasets.list();
        }, function (err) {
            alert("Error : " + err.data);
        });
    };

    // Make a dataset visible in the menu
    $scope.show = function (id) {
        datasets.show({
            id: encodeURIComponent(id)
        }, {
            hidden: false
        }, function () {
            // TO CHANGE
            $scope.lists.datasets = datasets.list();
        }, function (err) {
            alert("Error : " + err.data);
        });
    };

    // Update datasets informations
    $scope.update = function () {
        datasets.update({
            id: encodeURIComponent($scope.datasetChanges.id)
        }, {
            name: $scope.datasetChanges.name,
            description: $scope.datasetChanges.description
        }, function () {
            // TO CHANGE
            $scope.lists.datasets = datasets.list();
        }, function (err) {
            alert("Error : " + err.data);
        });
    };

    // Remove a dataset
    $scope.remove = function (name) {
        if (confirm("Do you really want to remove this dataset permanently?")) {
            datasets.remove({
                name: encodeURIComponent(name)
            }, function () {
                // TO CHANGE
                $scope.lists.datasets = datasets.list();
            }, function (err) {
                alert("Error : " + err.data);
            });
        }
    };

    // Ordering function
    $scope.order = function (header, reverse) {
        $scope.predicate = header;
        $scope.reverse = reverse;
        $scope.dataRows = $filter("orderBy")($scope.dataRows, $scope.predicate, $scope.reverse);
    };

    // Set the data URI of the display table for the download
    $scope.download = function () {
        $scope.dataHref = "data:text/plain;charset=utf-8," + encodeURI(jsonToTsv($scope.dataRows));
    };

    // Parse the file depending on its type
    $scope.parseFile = function (isAnnot) {
        var file = isAnnot ? $scope.annotFile.content : $scope.dataFile.content

        if (file.type === $scope.allowedTypes["xlsx"]) {
            xlsxToJson(file, function (err, json) {
                $scope.dataRows = json;
                $scope.$digest();
            });
        }

        else if (file.type === $scope.allowedTypes["tsv"] || file.type === $scope.allowedTypes["txt"]) {
            tsvToJson(file, function (err, json) {
                $scope.dataRows = json;
                $scope.$digest();
            });
        }

        else {
            alert("This file format is invalide.");
        }
    };

    // Send the data file to the server using a FormData
    $scope.sendData = function () {
        var allData = new FormData();

        // Put the name before the file to avoid problems with Multer on server side
        allData.append("newName", $scope.dataFile.newName);
        allData.append("dataFile", $scope.dataFile.content);
        allData.append("description", $scope.dataFile.description);

        $scope.dataIsUploading = true;

        datasets.create(allData, function () {
            $scope.dataIsUploading = false;
            $scope.lists.datasets = datasets.list();
            alert("Data successfully stored.");
            document.getElementById("dataUploadForm").reset(); // No better solution found with Angular
        }, function (err) {
            $scope.dataIsUploading = false;
            alert("Error : " + err.data);
        });
    }

    // Send the annotations file to the server using a FormData
    $scope.sendAnnot = function () {
        var allData = new FormData();

        allData.append("annotFile", $scope.annotFile.content);

        $scope.annotIsUploading = true;

        annotations.add(allData, function () {
            $scope.annotIsUploading = false;
            alert("Annotations successfully stored.");
            document.getElementById("annotUploadForm").reset();
        }, function (err) {
            $scope.annotIsUploading = false;
            alert("Error : " + err.data);
        });
    }
}]);
