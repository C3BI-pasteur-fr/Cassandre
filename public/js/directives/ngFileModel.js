/*
 * This directive creates new attributes
 * for file inputs. It allows you to detect properly
 * when the selected file changes, and bind it to the
 * controller scope.
 *
 * The attributes are :
 * 
 *     ng-file-model: contains the File object
 *     ng-file-name: contains the name of the file, for edition by users
 *
 */

angular.module("Cassandre").directive('ngFileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFileModel);
            var modelName = $parse(attrs.ngFileName);
            var modelSetter = model.assign;
            var modelNameSetter = modelName.assign;
            
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                    modelNameSetter(scope, element[0].files[0].name);
                });
            });
        }
    };
}]);