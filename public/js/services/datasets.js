/*
 * Angular service to access, set and share the datasets informations.
 *
 */


angular.module("cassandre").factory("datasets", ["datasetsHttp", "experiments", "genes", "stats", function datasetsFactory(datasetsHttp, experiments, genes, stats) {

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
        select: {
            all: function () {
                if (datasets.selected.length !== datasets.all.length) {
                    datasets.selected = datasets.all.map(function (set) {
                        return set.name;
                    });
                    experiments.get.all();
                    stats.get.selected(datasets.selected);
                }
                else {
                    datasets.selected.splice(0, datasets.selected.length);
                    experiments.reset.all();
                    stats.reset.selected();
                }
            },
            one: function (name) {
                var index = datasets.selected.indexOf(name);

                // Check or uncheck
                if ( index > -1) {
                    datasets.selected.splice(index, 1);
                }
                else {
                    datasets.selected.push(name);
                }
                
                // Refresh the lists accordingly
                if (datasets.selected.length === 0) {
                    experiments.reset.selected();
                    stats.reset.selected();
                }
                else {
                    experiments.get.selected(datasets.selected);
                    stats.get.selected(datasets.selected);
                }
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
                
                // Select the new one by default
                datasets.selected.push(response.name);

                // Refresh all the lists
                datasets.all = datasetsHttp.get();
                experiments.get.selected(datasets.selected);
                genes.get.all();
                stats.get.selected(datasets.selected);
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
                stats.get.all();

                // Unselect the removed set if needed
                if (datasets.selected.indexOf(name) > -1) {
                    datasets.selected.splice(datasets.selected.indexOf(name), 1);
                    experiments.get.selected(datasets.selected);
                }

            }, function (err) {
                alert("Error : " + err.data);
            });
        },
    };
}]);
