#!/usr/bin/env node

/*
 * This function check if a string, usually a gene or experiments name
 * can be a field in the MongoDB database : it can't contain dots or start
 * by a dollar sign.
 *
 */

module.exports = function (string) {
    if (string.indexOf('.')) {
        return false;
    }

    if (string[0] === '$') {
        return false;
    }

    return true;
};
