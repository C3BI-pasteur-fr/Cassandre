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
        var search = {
            global: [],
            columns: {}
        };

        // ----- Split the request ------------------ //

        var terms = request.match(/"[^"]*"|\S+/g);

        /*
         * Regex :
         *
         *  | is the logical OR, separating two alternatives:
         *
         *      "([^"]*)" matches any string between "". This allows the user
         *                to search for strings containing spaces.
         *
         *      (\S+) matches any string separated by any group of characters
         *            composed by space characters \s \r \n \t \f.
         *
         *
         *  g modifier : global. Catch all matches, not just the first one.
         *
         */

        // ---------------------------------------- //

        // Parse the terms
        terms.forEach(function (term) {
            term = term.replace(/"/g, '');

            if (term.indexOf(":") > -1) {
                var index = term.indexOf(":");
                var column = term.substring(0, index).trim();
                var value = term.substring(index + 1).trim();

                search.columns[column] = value;
            }
            else {
                search.global.push(term.trim());
            }
        });

        // Filter the lines
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

        //return filteredGenes;
    }
});
