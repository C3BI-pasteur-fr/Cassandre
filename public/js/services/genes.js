/*
 *  Angular service to share the list of genes between every part
 *  of the application.
 *
 */


angular.module("cassandre").factory("genes", ["datasets", "genesHttp", "annotationsHttp", function (datasets, genesHttp, annotationsHttp) {

    var genes = {
        all: [],                 // The genes found in datasets
        selected: [],            // The genes selected in the side menu list
        annotations: {}          // Annotations for each gene
    };

    return {
        list: function () {
            return genes;
        },
        get: function () {
            genesHttp.get({ mId: datasets.list.selected() }, function (genesList) {
                genes.all = genesList;
            });
        },
        getAnnotations: function () {
            annotationsHttp.get(function (annotations) {
                // List the genes
                annotations.forEach(function (cell) {
                    if (!genes.annotations[cell.row]) {
                        genes.annotations[cell.row] = {};
                    }
                    if (!genes.annotations[cell.row][cell.column]) {
                        genes.annotations[cell.row][cell.column] = cell.value;
                    }
                });
            });
        }
    };
}]);
