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
 * Function to cast properly a single string.
 *
 * Dates not are handled currently due to
 * the number of possible formats.
 *
 */

// Regular expressions for the different numbers, allowing exponents
var integer = /^[+-]?\d+(?:e[+-]?\d+)?$/;
var decimal = /^[+-]?\d+\.\d+(?:e[+-]?\d+)?$/;

/*
 *  Explanation :
 *  --------------------------------------------------------------------
 *
 *  ^       assert position at start of a line
 *  [+-]?   match + or - one or zero time
 *  \d+     match a digit [0-9]
 *  \.      matches the . literally (decimal only)
 *
 *  Decimal only :
 *
 *  (?:e[+-]?\d+)? Non-capturing group :
 *
 *      ?:      mark it as non-capturing
 *      e       matches the character e literally (case sensitive)
 *      [+-]?   match + or - one or zero time
 *      \d+     match a digit [0-9]
 *      ?       match this group one or zero time
 *
 *  $       assert position at end of a line
 *  --------------------------------------------------------------------
 *
 */

module.exports = function (string) {

    if (integer.test(string)) {
        return parseFloat(string);      // Only parseFloat can handle exponents
    }

    if (decimal.test(string)) {
        return parseFloat(string);
    }

    if (string === "true") {
        return true;
    }

    if (string === "false") {
        return false;
    }

    return string;
}