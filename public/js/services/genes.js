/*
 * Copyright (C) 2016 Simon Malesys - Institut Pasteur
 *
 * This file is part of Cassandre
 *
 * Cassandre is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Cassandre is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

/*
 *  Angular service to share the list of genes between every part
 *  of the application.
 *
 */

angular.module("cassandre").factory("genes", ["genesHttp", "annotationsHttp", function (genesHttp, annotationsHttp) {

    var genes = {
        all: [],                 // The genes found in data sets
        selected: [],            // The genes selected in the side menu list
        annotationsFields: [],   // The complete list of annotation fields, used for the display
        sideMenu: {}             // The selected lists of genes in the aside section
    };

    function getAnnotationsSize(geneList) {
        var fields = [];

        geneList.forEach(function (gene) {
            Object.keys(gene.annotation).forEach(function (field) {
                if (fields.indexOf(field) === -1) {
                    fields.push(field);
                }
            });
        });

        return fields;
    }

    return {
        list: {
            all: function () {
                return genes;
            }
        },
        select: {
            one: function (list, gene) {
                genes.selected.push(gene);
                genes.sideMenu[list].selected.push(gene);
            }
            //many: function (list) {
            //    var select = this;
            //    list.forEach(function (gene) {
            //        if (genes.selected.indexOf(gene) === -1) {
            //            select.one(gene);
            //        }
            //    });
            //}
        },
        deselect: {
            one: function (list, gene) {
                genes.selected.splice(genes.selected.indexOf(gene), 1);
                genes.sideMenu[list].selected.splice(genes.sideMenu[list].selected.indexOf(gene), 1);
            }
            //many: function (list) {
            //    var deselect = this;
            //    list.forEach(function (gene) {
            //        if (genes.selected.indexOf(gene) > -1) {
            //            deselect.one(gene);
            //        }
            //    });
            //}
        },
        reset: {
            all: function () {
                genes.all = [];
            },
            selected: function () {
                genes.selected = [];
            }
        },
        get: {
            all: function () {
                genesHttp.get(function (geneList) {
                    genes.all = geneList;
                    genes.annotationsFields = getAnnotationsSize(geneList);
                });
            },
            selected: function (sets) {
                genesHttp.get({ sets: sets }, function (geneList) {
                    genes.all = geneList;
                    genes.annotationsFields = getAnnotationsSize(geneList);
                });
            }
        },
        remove: {
            annotations: function (annotations) {
                annotationsHttp.remove({}, function (response) {
                    genes.all = genesHttp.get();
                    genes.annotationsFields = [];
                    alert("Annotations successfully deleted.");
                });
            },
            list: function (list) {
                genes.sideMenu[list].selected.forEach(function (gene) {
                    if (genes.selected.indexOf(gene) > -1) {
                        genes.selected.splice(genes.selected.indexOf(gene), 1);
                    }
                });

                delete genes.sideMenu[list];
            }
        }
    };
}]);
