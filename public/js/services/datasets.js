/*
 * Angular service to access and set the dataset collection.
 *
 */

angular.module("cassandre").factory("datasets", [ "datasetsResource", function datasetsFactory (datasetsResource) {
    var shared = {
        datasets: {}
    };

    return {
        list: function () {
            return shared.datasets;
        },
        get: function () {
            datasetsResource.get(function (sets) {
                shared.datasets = sets;
                console.log("I loaded the sets.");
                console.log(shared.datasets);
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
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
    };
}]);