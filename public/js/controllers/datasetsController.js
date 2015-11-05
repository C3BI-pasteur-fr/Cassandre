/*
 * Angular controller for the "Datasets" section.
 *
 */

angular.module("cassandre").controller("DatasetsController", [ "$scope", "$filter", "datasets", function ($scope, $filter, datasets) {

    // Total numbers of datasets, experiments and genes
    $scope.dbStats = {
        total: {},
        selected: {}
    };

    // Marker for the datasets menu
    $scope.showHiddenDatasets = false;

    // The list of all datasets
    $scope.datasets = datasets.list();
console.log("I loaded the controller.");
console.log($scope.datasets);
    // the selected datasets in the menu
    $scope.selectedDatasets = [];

    // The menu filter
    $scope.filter = "";

    // When making changes to a dataset
    $scope.datasetChanges = {
        name: "",
        newName: "",
        description : ""
    };

    // ----- Initialization --------------------------------------------- //

    // Get the stats of the database
    //statistics.get(function (stats) {
    //    $scope.dbStats.total = stats;
    //    $scope.dbStats.selected = stats;
    //});

    // ----- Watchers on the Wall --------------------------------------- //

    // Refresh the statistics panel when the datasets selection changes
    $scope.$watch("selectedDatasets", function (newSet, oldSet) {

        // Spare a pointless request
        if (newSet.length === 0) {
            $scope.dbStats.selected = {
                datasets: 0,
                exp: 0,
                genes: 0
            };
        }

        // Get the new stats to the database and the new list of experiments
        else if (!angular.equals(newSet, oldSet)) {
            statistics.get({ datasets: newSet }, function (newStats) {
                $scope.dbStats.selected = newStats;
            });

            $scope.lists.exp = exp.list({
                mId: encodeURIComponent($scope.selectedDatasets)
            });
        }

    }, true);

    // ----- Functions -------------------------------------------------- //

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

    // Function to select dataset
    $scope.select = function (name) {
        if ($scope.selectedDatasets.indexOf(name) > -1) {
            $scope.selectedDatasets.splice(index, 1);
        }

        else {
            $scope.selectedDatasets.push(name);
        }
    };

    // Function to check/uncheck all
    $scope.selectAll = function () {
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
}]);