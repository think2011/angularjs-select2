define(function(require, exports, module) {
    require('select2/select2.min');

	var app = angular.module('app', []);

	app.controller('appCtrl', function ($scope) {
        $scope.a = [{title: '初始化数据', id: 1}];

        $scope.config = {
            multiple: true,
            allowClear: true,
            ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
                url: "http://api.rottentomatoes.com/api/public/v1.0/movies.json",
                dataType: 'jsonp',
                data: function (term, page) {
                    return {
                        q: term, // search term
                        page_limit: 10,
                        apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
                    };
                },
                results: function (data, page) { // parse the results into the format expected by Select2.
                    // since we are using custom formatting functions we do not need to alter remote JSON data
                    return {results: data.movies};
                }
            },
            initSelection: function(element, callback) {
                // the input tag has a value attribute preloaded that points to a preselected movie's id
                // this function resolves that id attribute to an object that select2 can render
                // using its formatResult renderer - that way the movie name is shown preselected
                var id=$(element).val();
                if (id!=="") {
                    $.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies/"+id+".json", {
                        data: {
                            apikey: "ju6z9mjyajq2djue3gbvv26t"
                        },
                        dataType: "jsonp"
                    }).done(function(data) { callback(data); });
                }
            },
            formatResult: function (data) {
                return data.title;
            }, // omitted for brevity, see the source of this page
            formatSelection: function (data) {
                return data.title;
            },  // omitted for brevity, see the source of this page
            dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
            escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
        }

	});

    app.directive('select2', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            priority: 10,   // 不设置，$render无效
            scope: {
              config: '=select2'
            },
            link: function (scope, element, attrs, ngModel) {
                // init
                var config = scope.config || {};
                config.placeholder = attrs.placeholder;
                config.allowClear = true;

                var $select2 = $(element).select2(config);
                $select2.on('change', function () {
                    updateModel();
                });

                // model - view
                ngModel.$render = function () {
                    $(element).select2('data', ngModel.$viewValue);
                };

                // view - model
                var updateModel = function () {
                    scope.$apply(function () {
                        var data = $(element).select2('data');
                        try { delete data.element } catch (e){ console.log(e) };
                        ngModel.$setViewValue(data);
                    });
                };
            }
        }
    });

	angular.bootstrap(document, ['app']);
});