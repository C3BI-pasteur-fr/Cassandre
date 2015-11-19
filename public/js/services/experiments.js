/*
 *  Angular service to share the list of experiments between every part
 *  of the application.
 *
 */


angular.module("cassandre").factory("experiments", ["expHttp", "datasets", function (expHttp, datasets) {
    
    var experiments = {
        all: [],                 // List of all the experiments found in datasets
        sideMenu: {}             // List of the selected lists of experimenst in the aside section
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
