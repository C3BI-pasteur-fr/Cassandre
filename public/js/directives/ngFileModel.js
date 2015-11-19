/*
 * This directive creates new attributes
 * for file inputs. It allows you to detect properly
 * when the selected file changes, and bind it to the
 * controller scope.
 *
 * The attributes are :
 *
 *     ng-file-model: contains the File object
 *     ng-file-name: contains the name of the file (optional)
 *
 */

angular.module("cassandre").directive('ngFileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFileModel);
            
            if (attrs.ngFileName) {
                var modelName = $parse(attrs.ngFileName);
            }

            element.bind('change', function () {
                scope.$apply(function () {
                    model.assign(scope, element[0].files[0]);
                    
                    if (attrs.ngFileName) {
                        modelName.assign(scope, element[0].files[0].name);
                    }
                });
            });
        }
    };
}]);