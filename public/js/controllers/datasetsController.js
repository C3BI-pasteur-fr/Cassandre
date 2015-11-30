/*
 * Angular controller for the "Datasets" section.
 *
 */

angular.module("cassandre").controller("DatasetsController", [ "$scope", "$filter", "datasets", "experiments", "stats",
    function ($scope, $filter, datasets, experiments, stats) {

    // ----- Datasets --------------------------------------------------- //

    $scope.sets = datasets.list.all();  // The whole datasets lists and markers
    $scope.filter = "";                 // The menu filter
    $scope.showHidden = false;          // Marker for the datasets menu
    $scope.changes = {                  // When editing a dataset informations
        name: "",
        newName: "",
        description : ""
    };

    // Function to select or deselect a dataset
    $scope.select = function (name) {
        datasets.select.one(name);
    };

    // Function to check/uncheck all
    $scope.selectAll = function () {
        datasets.select.all();
    };

    // Hide a dataset in the menu
    $scope.hide = function (name) {
        datasets.hide(name);
    };

    // Make a dataset visible in the menu
    $scope.show = function (name) {
        datasets.show(name);
    };

    // Update datasets informations
    $scope.update = function () {
        datasets.update($scope.changes);
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

    // List of the database statistics (datasets, experiments and genes)
    $scope.stats = stats.list();

}]);
