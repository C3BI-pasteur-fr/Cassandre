/*
 *  Angular service to share the list of experiments between every part
 *  of the application.
 *
 */


angular.module("cassandre").factory("experiments", ["expHttp", function (expHttp) {

    var experiments = {
        all: [],                 // All the experiments found in datasets
        selected: [],            // All the experiments selected in the side menu lists
        sideMenu: {}             // The selected lists of experiments in the aside section
    };

    return {
        list: function () {
            return experiments;
        },
        get: {
            all: function () {
                expHttp.get(function (expList) {
                    experiments.all = expList;
                });
            },
            selected: function (sets) {
                expHttp.get({ mId: sets }, function (expList) {
                    experiments.all = expList;
                });
            }
        },
        reset: {
            selected: function () {
                experiments.selected = [];
            }
        }
    };
}]);
