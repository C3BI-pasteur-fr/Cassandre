/*
 * Angular service to access, set and share the data sets informations.
 *
 */


angular.module("cassandre").factory("datasets", ["datasetsHttp", "experiments", "genes", "stats", function datasetsFactory(datasetsHttp, experiments, genes, stats) {

    var datasets = {
        all: [],                // List of all data sets
        selected: [],           // List of the selected data sets to search
        uploading: false        // Marker to know when a data set is uploading
    };

    // Handlers for generic actions on datasets
    var select = function (name) {
        datasets.selected.push(name);
        experiments.get.selected(datasets.selected);
        stats.get.selected(datasets.selected);
    }

    var deselect = function (name) {
        datasets.selected.splice(datasets.selected.indexOf(name), 1);

        if (datasets.selected.length === 0) {
            experiments.reset.selected();
            stats.reset.selected();
        }
        else {
            experiments.get.selected(datasets.selected);
            stats.get.selected(datasets.selected);
        }
    }

    var selectAll = function (displayedSets) {
        datasets.selected = displayedSets;
        experiments.get.all();
        stats.get.selected(datasets.selected);
    }

    var deselectAll = function () {
        datasets.selected.splice(0, datasets.selected.length);
        experiments.reset.all();
        stats.reset.selected();
    }

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
                var displayedSets = datasets.all
                .filter(function (set) {
                    return !set.hidden;
                })
                .map(function (set) {
                    return set.name;
                });

                if (angular.equals(datasets.selected, displayedSets)) {
                    deselectAll();
                }
                else {
                    selectAll(displayedSets);
                }
            },
            one: function (name) {
                var index = datasets.selected.indexOf(name);

                if (index > -1) {
                    deselect(name);
                }
                else {
                    select(name);
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
                var name = response.name;
            
                datasets.uploading = false;
                alert("Dataset " + name + " successfully stored.");

                // Select the new one by default and refresh the other lists
                datasetsHttp.get(function (response) {
                    datasets.all = response;
                    genes.get.all();
                    stats.get.all();
                    select(name);
                }, function (err) {
                    alert("Error : " + err.data);
                });

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

                // Deselect if needed
                if (datasets.selected.indexOf(name) > -1) {
                    deselect(name);
                }

                // Update the list
                datasets.all.forEach(function (set) {
                    if (set.name === name) {
                        set.hidden = true;
                    }
                });

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

                // Update the list
                datasets.all.forEach(function (set) {
                    if (set.name === name) {
                        set.hidden = false;
                    }
                });

            }, function (err) {
                alert("Error : " + err.data);
            });
        },
        update: function (changes) {
            datasetsHttp.update({
                name: encodeURIComponent(changes.datasetName)
            }, {
                name: changes.newName,
                description: changes.description
            }, function () {

                // Update the list
                datasets.all.forEach(function (set) {
                    if (set.name === changes.datasetName) {
                        set.name = changes.newName,
                        set.description = changes.description

                        if (datasets.selected.indexOf(changes.datasetName)) {
                            var index = datasets.selected.indexOf(changes.datasetName);
                            datasets.selected.splice(index, 1, changes.newName)
                        }
                    }
                });

            }, function (err) {
                alert("Error : " + err.data);
            });
        },
        remove: function (name) {
            datasetsHttp.remove({
                name: encodeURIComponent(name)
            }, function () {
                stats.get.all();

                // Deselect the removed set if needed
                if (datasets.selected.indexOf(name) > -1) {
                    deselect(name);
                }

                // Update the list
                datasets.all.forEach(function (set, index) {
                    if (set.name === name) {
                        datasets.all.splice(index, 1);
                    }
                });

            }, function (err) {
                alert("Error : " + err.data);
            });
        },
    };
}]);
