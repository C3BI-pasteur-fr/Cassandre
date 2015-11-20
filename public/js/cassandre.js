
/*
 * Main angular module for the Cassandre front-end
 *
 */

angular.module("cassandre", [ "ngResource" ])

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
 * Initialize the datasets and select them all by default.
 * The resource is used directly because the initialization of the selected
 * datasets has to occur only at the start.
 *
 * Then get all the experiments and genes.
 * 
 */

.run(function (datasets, datasetsHttp, experiments, genes) {
    var init = datasets.list.all();

    datasetsHttp.get(function (sets) {
        init.all = sets;
        init.selected = sets.map(function (set) {
            return set.name;
        });
        
        experiments.get();
        genes.get();
        genes.getAnnotations();
    });
});

// ---------------------------------------------------------------------- //