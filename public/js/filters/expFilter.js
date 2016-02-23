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
 * The filter of the experiments section.
 *
 */

angular.module("cassandre").filter("expFilter", function () {
    return function (experiments, search, limit) {
        
        if (!experiments) return {};
        if (!search) return {};
        
        var filteredExps = {};
        var counter = 0;
        var criteria = search.toLowerCase();
        
        for (var ID in experiments) {
            var exp = experiments[ID];

            if (limit && counter === limit) break;

            // Match an experiment name
            if (ID.toLowerCase().indexOf(criteria) > -1) {
                counter++;
                filteredExps[ID] = exp;
                continue;
            }

            // Match a dataset name
            for (var i = 0; i < exp.datasets.length; i++) {
                var dataset = exp.datasets[i];

                if (dataset.toLowerCase().indexOf(criteria) > -1) {
                    counter++;
                    filteredExps[ID] = exp;
                    break;
                }
            }
        }
        
        return filteredExps;
    }
});
