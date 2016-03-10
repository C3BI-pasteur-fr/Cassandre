/*
 * Copyright (C) 2016 Simon Malesys - Institut Pasteur
 *
 * This file is part of Cassandre
 *
 * Cassandre is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Cassandre is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

/*
 * Main controller of Cassandre for the display section.
 *
 */

angular.module("cassandre").controller("MainController", [
    "$scope", "$filter", "jsonToTsv", "datasets", "experiments", "genes", "data",
    function ($scope, $filter, jsonToTsv, datasets, experiments, genes, data) {

    $scope.data = {
        cells: [],                      // Data from database
        rows: [],                       // Data formatted in rows
        values: []
    };

    $scope.isLoading = false;           // Marker to know when data are loading

    $scope.datasets = datasets.list.all();
    $scope.exps = experiments.list.all();
    $scope.genes = genes.list.all();

    // Control switch for the displayed section
    $scope.activeSection = "genesSection";
    $scope.activate = function (section) {
        $scope.activeSection = section;
    };

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
            $scope.cellsToRows(data);
        });
    };

    $scope.limit = 10;
    $scope.limitOptions = {
        "Limit to 10 lines": 10,
        "Limit to 20 lines": 20,
        "Limit to 50 lines": 50,
        "Limit to 100 lines": 100,
        "Limit to 300 lines": 300
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
    $scope.cellsToRows = function(cells) {
        $scope.data.rows = [];
        var headers = [];
        var rows = {};

        // Build the headers
        // The column name is attached with the dataset name to avoid conflicts
        cells.forEach(function (cell) {
            var header = cell.exp.concat(" - ", cell.set);

            if (headers.indexOf(header) === -1) {
                headers.push(header);
            }
        });
        
        // Sort to have the same headers side to side in the display
        headers.sort();

        // Build the rows
        cells.forEach(function (cell) {
            var header = cell.exp.concat(" - ", cell.set);

            // Add the row if not yet present
            if (!rows[cell.gene]) {
                rows[cell.gene] = {};
                headers.forEach(function (header) {
                    rows[cell.gene][header] = null;
                });
            }

            // Add the value at the right place
            rows[cell.gene][header] = cell.value;
        });

        // Then format rows in an array of objects with headers as keys
        for (var gene in rows) {
            var newRow = { "ID": gene };

            for (var header in rows[gene]) {
                newRow[header] = rows[gene][header];
            };

            $scope.data.rows.push(newRow);
        }
    };

    // Ordering function
    $scope.order = function (header, reverse) {
        $scope.predicate = header;
        $scope.reverse = reverse;
        $scope.data.rows = $filter("orderBy")($scope.data.rows, "'" + header.replace(/['"]/g, "\\$&") + "'", reverse);
    };

    // Display an histogram
    $scope.histogram = function () {
        $scope.data.cells = data.get({
            sets: encodeURIComponent($scope.datasets.selected),
            exps: $scope.exps.selected,
            genes: $scope.genes.selected
        }, function (cells) {

            // Get all the current values
            $scope.data.values = cells.map(function (cell) {
                return cell.value;
            });

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
                ($scope.data.values)

            var y = d3.scale.linear()
                .domain([0, d3.max(data, function(d) { return d.y; })])
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var svg = d3.select(".chart")
                .append("svg")
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
