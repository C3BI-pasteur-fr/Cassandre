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
        all: {},                 // The genes found in data sets
        selected: [],            // The genes selected in the side menu list
        annotationsFields: [],   // The complete list of annotation fields, used for the display
        sideMenu: {}             // The selected lists of genes in the aside section
    };

    // Get the complete list of annotations fields for all genes
    function getAnnotationsFields(geneList) {
        var fields = [];

        for (var ID in geneList) {
            Object.keys(geneList[ID].annotation).forEach(function (field) {
                if (fields.indexOf(field) === -1) {
                    fields.push(field);
                }
            });
        };

        return fields;
    }

    return {
        list: {
            all: function () {
                return genes;
            },
            dataset: function (dataset) {
                var list = {};

                for (var ID in genes.all) {
                    if (genes.all[ID].datasets.indexOf(dataset) > -1) {
                        list[ID] = genes.all[ID];
                    }
                }

                return list;
            }
        },
        select: {
            one: function (gene) {
                if (genes.selected.indexOf(gene) === -1) {
                    genes.selected.push(gene);

                    for (var list in genes.sideMenu) {
                        if (genes.sideMenu[list].all.indexOf(gene) > -1) {
                            genes.sideMenu[list].selected.push(gene);
                        }
                    }
                }
            },
            many: function (geneList) {
                var select = this;
                geneList.forEach(function (gene) {
                    select.one(gene);
                });
            }
        },
        deselect: {
            one: function (gene) {
                if (genes.selected.indexOf(gene) > -1) {
                    genes.selected.splice(genes.selected.indexOf(gene), 1);

                    for (var list in genes.sideMenu) {
                        if (genes.sideMenu[list].selected.indexOf(gene) > -1) {
                            var index = genes.sideMenu[list].selected.indexOf(gene);
                            genes.sideMenu[list].selected.splice(index, 1);
                        }
                    }
                }
            },
            many: function (geneList) {
                var deselect = this;
                geneList.forEach(function (gene) {
                    deselect.one(gene);
                });
            }
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
                    genes.all = geneList.toJSON();
                    genes.annotationsFields = getAnnotationsFields(geneList.toJSON());
                });
            },
            selected: function (sets) {
                genesHttp.get({ sets: sets }, function (geneList) {
                    genes.all = geneList.toJSON();
                    genes.annotationsFields = getAnnotationsFields(geneList.toJSON());
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
