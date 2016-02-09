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
 * Angular service to store and share the database statistics about the data sets,
 * the experiments and the genes.
 *
 */

angular.module("cassandre").factory("stats", [ "statsHttp", function statsFactory (statsHttp) {

    var stats = {
        all: {},                // Total numbers of data sets, experiments and genes
        selected: {}            // Numbers of selected data sets, experiments and genes
    };

    return {
        list:function () {
            return stats;
        },
        get: {
            all: function () {
                return statsHttp.get(function (statistics) {
                    stats.all = statistics;
                });
            },
            selected: function (sets) {
                return statsHttp.get({ datasets: sets }, function (statistics) {
                    stats.selected = statistics;
                });
            }
        },
        reset: {
            selected: function () {
                stats.selected = {
                    datasets: 0,
                    exps: 0,
                    genes: 0
                };
            }
        }
    };
}]);
