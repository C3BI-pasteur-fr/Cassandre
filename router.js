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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ============================================================================
// ============================================================================

var multer = require('multer');

var statsHandler = require('./routes/statsHandler');
var datasetsHandler = require('./routes/datasetsHandler');
var experimentsHandler = require('./routes/experimentsHandler');
var genesHandler = require('./routes/genesHandler');
var annotationsHandler = require('./routes/annotationsHandler');
var dataHandler = require('./routes/dataHandler');

module.exports = function (app) {

// CONGIGURATION
// ============================================================================

    // Multer middleware to handle file uploads
    var storage = multer.diskStorage({
        destination: './uploads/',
        filename: function (req, file, callback) {
            return callback(null, file.originalname + '-' + (new Date()).toISOString());
        }
    });

    var upload = multer({
        storage: storage
        // fileFilter
        // limits
    });

    var datasetFileHandler = upload.fields([
        { name: 'dataset', maxCount: 1 },
        { name: 'metadata', maxCount: 1 }
    ]);

    var annotFileHandler = upload.single('annotations');

// ROUTES
// ============================================================================

    app.route('/api/stats')

    .get(statsHandler)

// ============================================================================

    app.route('/api/datasets')

    .get(datasetsHandler.GET)

    .put(datasetsHandler.PUT)

    .delete(datasetsHandler.DELETE)

    .post(datasetFileHandler, datasetsHandler.POST);

// ============================================================================

    app.route('/api/exp/')

    .get(experimentsHandler.GET);

// ============================================================================

    app.route('/api/genes/')

    .get(genesHandler.GET);

// ============================================================================

    app.route('/api/genes/annotations')

    .post(annotFileHandler, annotationsHandler.POST)

    .delete(annotationsHandler.DELETE);

// ============================================================================

    app.route('/api/data/:sets')

    .get(dataHandler.GET);
};
