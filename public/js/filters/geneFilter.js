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
    return function(genes, search, limit) {

        if (!genes) return {};
        if (!search) return {};

        var filteredGenes = {};
        var counter = 0;
        var criteria = search.toLowerCase();

        for (var ID in genes) {
            var gene = genes[ID];

            if (limit && counter === limit) break;

            // Match a gene name
            if (ID.toLowerCase().indexOf(criteria) > -1) {
                counter++;
                filteredGenes[ID] = gene;
                continue;
            }

            // Match a value in the annotation
            for (var field in gene.annotation) {
                var value = gene.annotation[field];

                if (value.toString().toLowerCase().indexOf(criteria) > -1) {
                    counter++;
                    filteredGenes[ID] = gene;
                    break;
                }
            }
        }

        return filteredGenes;
    }
});
