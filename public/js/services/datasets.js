/*
 * Angular service to access, set and share the datasets informations.
 *
 */


angular.module("cassandre").factory("datasets", [ "datasetsHttp", "stats", function datasetsFactory (datasetsHttp, stats) {

    var datasets = {
        all: [],                // List of all datasets
        selected: [],           // List of the selected datasets to search
        uploading: false        // Marker to know when a dataset is uploading
    };

    return {
        list: {
            all: function () {
                return datasets;
            },
            selected: function () {
                return datasets.selected;
            }
        },
        get: function () {
            datasetsHttp.get(function (sets) {
                datasets.all = sets;
            });
        },
        add: function (formData) {
            datasets.uploading = true;
            datasetsHttp.add(formData, function () {
                datasets.uploading = false;
                alert("Data successfully stored.");
                datasets.all = datasetsHttp.get();
                /////////
                // Get also the genes, experiments and select the new one by default
                /////////
                stats.get.all();
            }, function (err) {
                datasets.uploading = false;
                alert("Error : " + err.data);
            });
        },
        hide: function (name) {
            datasetsHttp.update({
                name: encodeURIComponent(name)
            }, {
                hidden: true
            }, function () {
                // TO CHANGE
                datasets.all = datasetsHttp.get();
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
        show: function (name) {
            datasetsHttp.update({
                name: encodeURIComponent(name)
            }, {
                hidden: false
            }, function () {
                // TO CHANGE
                datasets.all = datasetsHttp.get();
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
        update: function (changes) {
            datasetsHttp.update({
                name: encodeURIComponent(changes.name)
            }, {
                name: changes.newName,
                description: changes.description
            }, function () {
                // TO CHANGE
                datasets.all = datasetsHttp.get();
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
        remove: function (name) {
            datasetsHttp.remove({
                name: encodeURIComponent(name)
            }, function () {
                // TO CHANGE
                datasets.all = datasetsHttp.get();
                $rootScope.$broadcast("datasets.update");
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
    };
}]);
