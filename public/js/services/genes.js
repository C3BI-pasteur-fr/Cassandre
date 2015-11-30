/*
 *  Angular service to share the list of genes between every part
 *  of the application.
 *
 */


angular.module("cassandre").factory("genes", ["genesHttp", "annotationsHttp", function (genesHttp, annotationsHttp) {

    var genes = {
        all: [],                 // The genes found in datasets
        selected: [],            // The genes selected in the side menu list
        annotations: {}          // Annotations for each gene
    };

    return {
        list: function () {
            return genes;
        },
        get: {
            all: function () {
                genesHttp.get(function (genesList) {
                    genes.all = genesList;
                });
            },
            selected: function (sets) {
                genesHttp.get({ sets: sets }, function (genesList) {
                    genes.all = genesList;
                });
            }
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
