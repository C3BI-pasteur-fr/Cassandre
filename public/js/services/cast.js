/*
 * Service to cast properly a single string.
 *
 * Dates are currently not handled due to
 * the number of possible formats.
 *
 */

angular.module("cassandre").factory("cast", function castFactory() {

    // Regular expressions for the different numbers, allowing exponents
    var integer = /^[+-]?\d+(?:e[+-]?\d+)?$/;
    var decimal = /^[+-]?\d+\.\d+(?:e[+-]?\d+)?$/;

    /*
     *  ----- Explanation --------------------------------------------------
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
     *
     *  --------------------------------------------------------------------
     */

    return function (string) {

        if (integer.test(string) || decimal.test(string)) {
            return parseFloat(string);
        }

        if (string.toLowerCase() === "true") {
            return true;
        }

        if (string.toLowerCase() === "false") {
            return false;
        }

        return string;
    }
});
