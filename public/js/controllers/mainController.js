/*
 * Main controller of Cassandre for the display section.
 *
 */


angular.module("cassandre").controller("MainController", [
    "$scope", "$filter", "jsonToTsv", "datasets", "experiments", "genes", "data",
    function ($scope, $filter, jsonToTsv, datasets, experiments, genes, data) {

    $scope.data = {
        cells: [],                      // Data from database
        rows: []                        // Data formatted in rows
    };

    $scope.isLoading = false;           // Marker to know when data are loading

    $scope.datasets = datasets.list.all();
    $scope.exps = experiments.list.all();
    $scope.genes = genes.list.all();

    // Control switch for the displayed section
    $scope.activeSection = "experimentsSection";

    // Used for ordering the results and mark the columns
    $scope.predicate = "";
    $scope.reverse = false;

    // Get the data for the selected genes and/or exp
    $scope.getData = function () {
        $scope.data.cells = data.get({
            sets: encodeURIComponent($scope.datasets.selected),
            exps: $scope.exps.selected,
            genes: $scope.genes.selected
        }, function (data) {
            $scope.cellsToRows(data, "exp", "gene", "value");
        });
    };

    $scope.limit = 10;
    $scope.limitOptions = {
        "Limit to 10 lines": 10,
        "Limit to 20 lines": 20,
        "Limit to 50 lines": 50,
        "Limit to 100 lines": 100,
        "No Limit": undefined
    };
    
    $scope.filters = {
        active: false,
        list: {},
        reset: function () {
            this.list = {};
        }
    };

    // Handle the data URI of the display table for the download
    $scope.download = {
        href: "",           
        emptyCells: "",
        setHref: function () {
            this.href = "data:text/plain;charset=utf-8," + encodeURI(jsonToTsv($scope.data.rows, this.emptyCells));
        }
    };
    
    // Erase the table results
    $scope.erase = function () {
        $scope.data.rows = [];
    };

    // Format data into rows to ease the display in the view
    $scope.cellsToRows = function(data, colName, rowName, valueName) {
        $scope.data.rows = [];
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

            $scope.data.rows.push(newRow);
        }
    };

    // Ordering function
    $scope.order = function (header, reverse) {
        $scope.predicate = header;
        $scope.reverse = reverse;
        $scope.data.rows = $filter("orderBy")($scope.data.rows, "'" + header + "'", $scope.reverse);
    };


    // Display an histogram
    $scope.histogram = function () {
        $scope.data.cells = data.get({
            sets: encodeURIComponent($scope.datasets.selected),
            exps: $scope.exps.selected,
            genes: $scope.genes.selected
        }, function (cells) {

            // Get all the current values
            var values = cells.map(function (cell) {
                return cell.value;
            });
            console.log(values);
    
            // A formatter for counts.
            var formatCount = d3.format(",.0f");
    
            var margin = {top: 10, right: 30, bottom: 30, left: 30},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var x = d3.scale.linear()
                .domain([0, 2])
                .range([0, width]);

            // Generate a histogram using twenty uniformly-spaced bins.
            var data = d3.layout.histogram()
                .bins(x.ticks(20))
                (values);

            var y = d3.scale.linear()
                .domain([0, d3.max(data, function(d) { return d.y; })])
                .range([height, 0]);
    
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
    
            var svg = d3.select(".chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
            var bar = svg.selectAll(".bar")
                .data(data)
                .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
    
            bar.append("rect")
                .attr("x", 1)
                .attr("width", x(data[0].dx) - 1)
                .attr("height", function(d) { return height - y(d.y); });
    
            bar.append("text")
                .attr("dy", ".75em")
                .attr("y", 6)
                .attr("x", x(data[0].dx) / 2)
                .attr("text-anchor", "middle")
                .text(function(d) { return formatCount(d.y); });
    
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
        });
    }
}]);
