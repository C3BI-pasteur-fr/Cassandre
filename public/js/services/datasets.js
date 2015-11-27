/*
 * Angular service to access, set and share the datasets informations.
 *
 */


angular.module("cassandre").factory("datasets", ["datasetsHttp", "experiments", "genes", "stats", function datasetsFactory(datasetsHttp, stats, experiments, genes) {

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
            datasetsHttp.add(formData, function (response) {

                datasets.uploading = false;
                alert("Dataset " + response.name + " successfully stored.");
                
                // Refresh all the lists
                datasets.all = datasetsHttp.get();
                genes.get.all();
                stats.get.all();
                
                // Select the new one by default
                datasets.selected.push(response.name);
                experiments.get.selected(datasets.selected);
                
                //////// TROUBLES HERE ////////////

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
                stats.get.all();
                //////// TROUBLES HERE ////////////
            }, function (err) {
                alert("Error : " + err.data);
            });
        },
    };
}]);
