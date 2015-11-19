/*
 *  Angular service to share the list of genes between every part
 *  of the application.
 *
 */


angular.module("cassandre").factory("genes", ["genesHttp", "datasets", function (genesHttp, datasets) {
    
    var genes = {
        all: [],                 // List of all the genes found in datasets
        selected: []             // List of all the genes selected in the side menu list.
    };

    return {
        list: function () {
            return genes;
        },
        get: function () {
            genesHttp.get({ mId: datasets.list.selected() }, function (genesList) {
                genes.all = genesList;
            });
        }
    };
}]);
