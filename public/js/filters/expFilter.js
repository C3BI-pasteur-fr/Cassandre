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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

/*
 * The filter of the experiments section.
 *
 */

angular.module("cassandre").filter("expFilter", function () {
    return function (experiments, request, limit) {

        if (!experiments) return {};
        if (!request) return {};

        var filteredExps = {};                  // The list of filtered exps to return
        var counter = 0;                        // A counter to stop at the limit       
        var terms = request                     // Parse the request
            .match(/"[^"]*"|\S+/g)
            .map(function (term) {
                return term
                    .replace(/"/g, '')
                    .toLowerCase()
                    .trim();
            });

        // Function to test if an experiment match the request
        function match(term, ID, exp) {

            // Match an experiment name
            if (ID.toLowerCase().indexOf(term) > -1) {
                return true;
            }

            // Match a dataset name or a metadata value
            for (var i = 0; i < exp.datasets.length; i++) {
                var dataset = exp.datasets[i];
                var metadata = exp.metadata[dataset];

                // Match a dataset name
                if (dataset.toLowerCase().indexOf(term) > -1) {
                    return true;
                }

                // Match a value in the metadata
                for (var field in metadata) {
                    var value = metadata[field]
                        .toString()
                        .toLowerCase();

                    if (value.indexOf(term) > -1) {
                        return true;
                    }
                }

                return false;
            }
        }

        // Filter all the experiments
        for (var ID in experiments) {
            if (limit && counter === limit) break;

            var expMatch = terms.every(function (term) {
                return match(term, ID, experiments[ID]);
            });

            if (expMatch) {
                counter ++;
                filteredExps[ID] = experiments[ID];
            }
        }

        return filteredExps;
    }
});
