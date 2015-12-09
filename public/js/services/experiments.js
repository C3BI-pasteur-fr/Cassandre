/*
 *  Angular service to share the list of experiments between every part
 *  of the application.
 *
 */


angular.module("cassandre").factory("experiments", ["expHttp", function (expHttp) {

    var experiments = {
        all: [],                 // All the experiments found in data sets
        selected: [],            // All the experiments selected in the side menu lists
        sideMenu: {}             // The selected lists of experiments in the aside section
    };

    return {
        list: {
            all: function () {
                return experiments;
            }
        },
        select: function (list, exp) {
            if (experiments.selected.indexOf(exp) === -1) {
                experiments.selected.push(exp);
                experiments.sideMenu[list].selected.push(exp);
            }
            else {
                experiments.selected.splice(experiments.selected.indexOf(exp), 1);
                experiments.sideMenu[list].selected.splice(experiments.sideMenu[list].selected.indexOf(exp), 1);
            }
        },
        reset: {
            all: function () {
                experiments.all = [];
            },
            selected: function () {
                experiments.selected = [];
            }
        },
        get: {
            all: function () {
                expHttp.get(function (expList) {
                    experiments.all = expList;
                });
            },
            selected: function (sets) {
                expHttp.get({ sets: sets }, function (expList) {
                    experiments.all = expList;
                });
            }
        }
    };
}]);
