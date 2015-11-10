/*
 * Angular controller for the "Datasets" section.
 *
 */

angular.module("cassandre").controller("DatasetsController", [ "$scope", "$filter", "datasets", "statistics",
    function ($scope, $filter, datasets, statistics) {

    // ----- Datasets --------------------------------------------------- //

    $scope.sets = {
        all: [],                // The list of all datasets
        selected: [],           // The selected datasets in the menu
        filter: "",             // The menu filter
        showHidden: false,      // Marker for the datasets menu
        changes: {              // When editing a dataset informations
            name: "",
            newName: "",
            description : ""
        }
    };
   
    ////////////// PROBLEM HERE /////////////////////////
    // Listener for datasets changes
    $scope.$on("datasets.update", function () {
        $scope.sets.all = datasets.list.all();
        $scope.sets.selected = datasets.list.names();
    });

    // Initialization
    //$scope.sets.selected = datasets.list.names();

    // Function to select a dataset
    $scope.select = function (name) {
        var index = $scope.sets.selected.indexOf(name);

        if ( index > -1) {
            $scope.sets.selected.splice(index, 1);
        }

        else {
            $scope.sets.selected.push(name);
        }
    };

    // Function to check/uncheck all
    $scope.selectAll = function () {
        if ($scope.sets.selected.length !== $scope.sets.all.length) {
            $scope.sets.selected = datasets.list.names();
        }
        else {
            $scope.sets.selected = [];
        }
    };

    // Hide a dataset in the menu
    $scope.hide = function (id) {
        datasets.hide(id);
    };

    // Make a dataset visible in the menu
    $scope.show = function (id) {
        datasets.show(id);
    };

    // Update datasets informations
    $scope.update = function (datasetsChanges) {
        datasets.update(datasetsChanges);
    };

    // Remove a dataset
    $scope.remove = function (name) {
        if (confirm("Do you really want to remove this dataset permanently?")) {
            datasets.remove(name);
        }
    };

    // Turn an ISO string date into a human readable string
    $scope.formatDate = function (date) {
        return date.replace(/T/, ' ')      // Replace T with a space
                   .replace(/\..+/, '');   // Delete the dot and everything after
    };

    // ----- Database statistics ---------------------------------------- //

    // Initialization
    statistics.get(function (stats) {
        $scope.stats.all = stats;
        $scope.stats.selected = stats;
    });
    
    // Total numbers of datasets, experiments and genes
    $scope.stats = {
        all: statistics.get(),
        selected: {}
    };

    // Refresh the statistics panel when the datasets selection changes
    $scope.$watch("sets.selected", function (newList, oldList) {

        // Spare a pointless request
        if (newList.length === 0) {
            $scope.stats.selected = {
                datasets: 0,
                exp: 0,
                genes: 0
            };
        }

        // Get the new stats to the database and the new list of experiments
        else if (!angular.equals(newList, oldList)) {
            statistics.get({ datasets: $scope.sets.selected }, function (newStats) {
                $scope.stats.selected = newStats;
            });
        }

    }, true);
}]);
