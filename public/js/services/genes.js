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
                genes.all = genesHttp.get();
            },
            selected: function (sets) {
                genes.all = genesHttp.get({ sets: sets });
            }
        },
        remove: {
            annotations: function (annotations) {
                annotationsHttp.remove({}, function (response) {
                    genes.all = genesHttp.get();
                    alert("Annotations successfully deleted.");
                });
            }
        }
    };
}]);
