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
 * Main angular module for the Cassandre front-end
 *
 */

angular.module("cassandre", ["ngResource"])

// ----- Config phase --------------------------------------------------- //

.config(function ($compileProvider) {

    /*
     * Add "data" to the url regex of the angular white list.
     * This is necessary to pass angular security mesures against XSS attacks,
     * and allow us to use a dataURI to download the table of the result section.
     *
     */

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|data):/);
})

// ----- Run Phase ------------------------------------------------------ //

.run(function ($rootScope, datasets, datasetsHttp, experiments, genes, stats, config) {
    var init = datasets.list.all();
    $rootScope.config = {};

    /*
     * Initialize the data sets and select them all by default if they're not hidden.
     * The resource is used directly because the initialization of the selected
     * data sets has to occur only at the start.
     *
     * Then get all the experiments and genes.
     *
     */

    datasetsHttp.get(function (sets) {
        init.all = sets;
        datasets.select.all();
        stats.get.all();
        stats.get.selected(init.selected);
        experiments.get.selected(init.selected);
        genes.get.all();
    });

    // Get the interface configuration
    config.get(function (config) {
        Object.assign($rootScope.config, config.toJSON());
    });
});

// ---------------------------------------------------------------------- //