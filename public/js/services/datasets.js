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
    function select(name) {
        datasets.selected.push(name);
        experiments.get.selected(datasets.selected);
        stats.get.selected(datasets.selected);
    }

    function deselect(name) {
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
    
    function selectAll() {
        datasets.selected = datasets.all
        .filter(function (set) {
            return !set.hidden
        })
        .map(function (set) {
            return set.name;
        });
        
        experiments.get.all();
        stats.get.selected(datasets.selected);
    }
    
    function deselectAll() {
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
                    selectAll();
                }
            },
            one: function (name) {
                var index = datasets.selected.indexOf(name);
                
                if ( index > -1) {
                    select(name);
                }
                else {
                    deselect(name);
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
                
                // Select the new one by default and refresh the other lists
                datasets.all = datasetsHttp.get();
                select(name);
                genes.get.all();
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
                deselect(name);
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
                    deselect(name);
                }

            }, function (err) {
                alert("Error : " + err.data);
            });
        },
    };
}]);
