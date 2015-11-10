
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

.run(function (datasets) {
    datasets.get();
    console.log("Run block");
});
