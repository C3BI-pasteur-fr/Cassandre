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