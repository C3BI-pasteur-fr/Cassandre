
/*
 * Main angular module for the Cassandre front-end
 *
 */

angular.module("cassandre", ["ngResource"])

// ----- Config phase --------------------------------------------------- //

/*
 * Add "data" to the url regex of the angular white list.
 * This is necessary to pass angular security mesures against XSS attacks,
 * and allow us to use a dataURI to download the table of the result section.
 *
 */

.config(function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|data):/);
})

// ----- Run Phase ------------------------------------------------------ //

/*
 * Initialize the data sets and select them all by default if they're not hidden.
 * The resource is used directly because the initialization of the selected
 * data sets has to occur only at the start.
 *
 * Then get all the experiments and genes.
 *
 */

.run(function (datasets, datasetsHttp, experiments, genes, stats) {
    var init = datasets.list.all();

    datasetsHttp.get(function (sets) {
        init.all = sets;
        datasets.select.all();
        stats.get.all();
        stats.get.selected(init.selected);
        experiments.get.selected(init.selected);
        genes.get.all();
        genes.get.annotations();
    });
});

// ---------------------------------------------------------------------- //