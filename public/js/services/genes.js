/*
 *  Angular service to share the list of genes between every part
 *  of the application.
 *
 */


angular.module("cassandre").factory("genes", ["genesHttp", "annotationsHttp", function (genesHttp, annotationsHttp) {

    var genes = {
        all: [],                 // The genes found in data sets
        selected: [],            // The genes selected in the side menu list
        annotations: {}          // Annotations for each gene
    };

    return {
        list: {
            all: function () {
                return genes;
            }
        },
        select: {
            one: function (gene) {
                genes.selected.push(gene);
            },
            many: function (list) {
                var select = this;
                list.forEach(function (gene) {
                    if (genes.selected.indexOf(gene) === -1) {
                        select.one(gene);
                    }
                });
            }
        },
        deselect: {
            one: function (gene) {
                genes.selected.splice(genes.selected.indexOf(gene), 1);
            },
            many: function (list) {
                var deselect = this;
                list.forEach(function (gene) {
                    if (genes.selected.indexOf(gene) > -1) {
                        deselect.one(gene);
                    }
                });
            }
        },
        get: {
            all: function () {
                genes.all = genesHttp.get();
            },
            selected: function (sets) {
                genes.all = genesHttp.get({ sets: sets });
            },
            annotations: function (annotations) {
                genes.annotations = annotationsHttp.get();
            }
        }
    };
}]);
