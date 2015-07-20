/*
 * This directive creates an "on-file-change" attribute
 * for file inputs. It allows you to detect properly
 * when the selected file changes, since angular manages
 * this very badly.
 * 
 * The value of the attribute is neccessarily a function
 * or an angular expression.
 *
 */

angular.module("Cassandre").directive("onFileChange", function () {
    return {
        restrict: "A",
        scope: {
            // Storing the function in the isolated scope of the directive
            changeFunction: "&onFileChange"
        },
        link: function (scope, element, attrs) {
            element.on("change", function () {
                // Executing the function
                scope.changeFunction();
            });
        }
    };
});