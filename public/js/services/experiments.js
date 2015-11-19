/*
 *  Angular service to share the list of experiments between every part
 *  of the application.
 *
 */


angular.module("cassandre").factory("experiments", ["expHttp", "datasets", function (expHttp, datasets) {

    var experiments = {
        all: [],                 // All the experiments found in datasets
        selected: [],            // All the experiments selected in the side menu lists
        sideMenu: {}             // The selected lists of experiments in the aside section
    };

    return {
        list: function () {
            return experiments;
        },
        get: function () {
            expHttp.get({ mId: datasets.list.selected() }, function (expList) {
                experiments.all = expList;
            });
        }
    };
}]);
