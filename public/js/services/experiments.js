/*
 *  Angular service to share the list of experiments between every part
 *  of the application.
 *
 */


angular.module("cassandre").factory("experiments", ["expHttp", function (expHttp) {

    var exps = {
        all: [],                 // All the experiments found in data sets
        selected: [],            // All the experiments selected in the side menu lists
        sideMenu: {}             // The selected lists of experiments in the aside section
    };

    return {
        list: {
            all: function () {
                return exps;
            }
        },
        select: {
            one: function (list, exp) {
                exps.selected.push(exp);
                exps.sideMenu[list].selected.push(exp);
            }
        },
        deselect: {
            one: function (list, exp) {
                exps.selected.splice(exps.selected.indexOf(exp), 1);
                exps.sideMenu[list].selected.splice(exps.sideMenu[list].selected.indexOf(exp), 1);
            }
        },
        remove: {
            list: function (list) {
                exps.sideMenu[list].selected.forEach(function (exp) {
                    if (exps.selected.indexOf(exp) > -1) {
                        exps.selected.splice(exps.selected.indexOf(exp), 1);
                    }
                });
                
                delete exps.sideMenu[list];
            }
        },
        reset: {
            all: function () {
                exps.all = [];
            },
            selected: function () {
                exps.selected = [];
            }
        },
        get: {
            all: function () {
                expHttp.get(function (expList) {
                    exps.all = expList;
                });
            },
            selected: function (sets) {
                expHttp.get({ sets: sets }, function (expList) {
                    exps.all = expList;
                });
            }
        }
    };
}]);
