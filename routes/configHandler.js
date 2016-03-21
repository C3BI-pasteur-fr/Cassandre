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

var fs = require('fs');
var config = require('../config/default.json');

// ============================================================================

// Return the interface configuration
exports.GET = function (req, res) {
    return res.status(200).send(config.interface);
};

// ============================================================================

// Update the interface configuration
exports.PUT = [

    // Set the in-memory config and write the config file
    function (req, res, next) {
        config.interface = req.body;

        var path = __dirname + '/../config/default.json';
        var configJson = JSON.stringify(config, null, 4);

        fs.writeFile(path, configJson, function (err) {
            if (err) return next({ status: 500, body: err });
            return res.sendStatus(204);
        });
    },

    // Error handler
    function (err, req, res, next) {
        if (err.body) {
            return res.status(err.status).send(err.body.message);
        }
        return res.status(500).send(err.message);
    }
];
