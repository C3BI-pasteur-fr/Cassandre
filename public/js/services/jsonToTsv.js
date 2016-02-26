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
 * Service used to format the displayed data so it can be
 * downloaded by the user.
 *
 */

angular.module("cassandre").factory("jsonToTsv", function writeDataFactory() {
    return function (data, emptyCellsValue) {

        // Ensure the order of the columns
        var orderedKeys = Object.keys(data[0]);

        // Strip angular $$hashKey property
        orderedKeys.splice(orderedKeys.indexOf("$$hashKey"), 1);

        // Setting the headers
        var tsv = orderedKeys.join("\t").concat("\n");

        for (var i = 0; i < data.length; i++) {
            var row = data[i];

            for (var j = 0; j < orderedKeys.length; j++) {
                var key = orderedKeys[j];
                var value = row[key] || emptyCellsValue;

                // The last value of each row get a new line instead of a tab
                if (j !== orderedKeys.length - 1) {
                    tsv = tsv.concat(value, "\t");
                }
                else {
                    tsv = tsv.concat(value, "\n");
                }
            }
        }

        return tsv;
    }
});
