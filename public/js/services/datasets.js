/*
 * Angular service to access and set the dataset collection.
 *
 */

angular.module("cassandre").factory("datasets", [ "$rootScope", "datasetsResource", function datasetsFactory ($rootScope, datasetsResource) {
    var shared = {
        datasets: []
    };

    return {
        list: {
            all: function () {
                return shared.datasets;
            },
            names: function () {
                return shared.datasets.map(function (set) {
                    return set.name;
                });
            }
        },
        get: function () {
            datasetsResource.get(function (sets) {
                shared.datasets = sets;
                $rootScope.$broadcast("datasets.update");
            });
        },
        add: function (formData) {
            datasetsResource.add(allData, function () {
                alert("Data successfully stored.");
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
        hide: function (id) {
            datasetsResource.hide({
                id: encodeURIComponent(id)
            }, {
                hidden: true
            }, function () {
                // TO CHANGE
                shared.datasets = datasetsResource.get();
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
        show: function (id) {
            datasetsResource.show({
                id: encodeURIComponent(id)
            }, {
                hidden: false
            }, function () {
                // TO CHANGE
                shared.datasets = datasetsResource.get();
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
        update: function (changes) {
            datasets.update({
                name: encodeURIComponent(changes.name)
            }, {
                newName: changes.newName,
                description: changes.description
            }, function () {
                // TO CHANGE
                shared.datasets = datasetsResource.get();
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
        remove: function (name) {
            datasetsResource.remove({
                name: encodeURIComponent(name)
            }, function () {
                // TO CHANGE
                shared.datasets = datasetsResource.get();
                $rootScope.$broadcast("datasets.update");
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
    };
}]);