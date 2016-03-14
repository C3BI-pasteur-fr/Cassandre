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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

/*
 * The filter of the genes section.
 *
 */

angular.module("cassandre").filter("geneFilter", function () {
    return function(genes, request, limit) {

        if (!genes) return {};
        if (!request) return {};

        var filteredGenes = {};
        var counter = 0;

        // Parse the request
        var terms = request
            .match(/"[^"]*"|\S+/g)
            .map(function (term) {
                return term
                    .replace(/"/g, '')
                    .toLowerCase()
                    .trim();
            });

        // Function to test if a line match a term
        function match(term, ID, gene) {

            // Match a gene name
            if (ID.toLowerCase().indexOf(term) > -1) {
                return true;
            }

            // Match a value in the annotation
            for (var field in gene.annotation) {
                var value = gene
                    .annotation[field]
                    .toString()
                    .toLowerCase();

                if (value.indexOf(term) > -1) {
                    return true;
                }
            }

            return false;
        }

        // Filter the lines
        for (var ID in genes) {
            if (limit && counter === limit) break;

            var test = terms.every(function (term) {
                return match(term, ID, genes[ID]);
            });

            if (test) {
                counter ++;
                filteredGenes[ID] = genes[ID];
            }
        }

        return filteredGenes;
    }
});
