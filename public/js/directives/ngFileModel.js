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
 * This directive creates new attributes for file inputs.
 * It allows you to detect properly when the selected file changes
 * and to bind it to the controller scope.
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
                        var name = element[0].files[0].name.replace(/\.[^.]+$/, "");
                        modelName.assign(scope, name);
                    }
                });
            });
        }
    };
}]);
