var app = angular.module('app', []);
/**
 * select2封装
 * @param {scope} ng-model 选中的ID
 * @param {scope} select2-model 选中的详细内容
 * @param {scope} config 自定义配置
 * @param {String} [query] 内置的配置 (怎么也还得默认一个config)
 * @example
 * <input select2 ng-model="a" select2-model="b" config="config" type="text" placeholder="占位符" />
 * <input select2 ng-model="a" select2-model="b" config="default" query="member" type="text" placeholder="占位符" />
 * <select select2 ng-model="b" class="form-control"></select>
 */
app.directive('select2', function (select2Query) {
    return {
        restrict: 'A',
        scope: {
            config: '=',
            ngModel: '=',
            select2Model: '='
        },
        link: function (scope, element, attrs) {
            // 初始化
            var tagName = element[0].tagName,
                config = {
                    allowClear: true,
                    multiple: !!attrs.multiple,
                    placeholder: attrs.placeholder || ' '   // 修复不出现删除按钮的情况
                };

            // 生成select
            if(tagName === 'SELECT') {
                // 初始化
                var $element = $(element);
                delete config.multiple;

                angular.extend(config, scope.config);
                $element
                    .prepend('<option value=""></option>')
                    .val('')
                    .select2(config);

                // model - view
                scope.$watch('ngModel', function (newVal) {
                    setTimeout(function () {
                        $element.find('[value^="?"]').remove();    // 清除错误的数据
                        $element.select2('val', newVal);
                    },0);
                }, true);
                return false;
            }

            // 处理input
            if(tagName === 'INPUT') {
                // 初始化
                var $element = $(element);

                // 获取内置配置
                if(attrs.query) {
                    scope.config = select2Query[attrs.query]();
                }

                // 动态生成select2
                scope.$watch('config', function () {
                    angular.extend(config, scope.config);
                    $element.select2('destroy').select2(config);
                }, true);

                // view - model
                $element.on('change', function () {
                    scope.$apply(function () {
                        scope.select2Model = $element.select2('data');
                    });
                });

                // model - view
                scope.$watch('select2Model', function (newVal) {
                    $element.select2('data', newVal);
                }, true);

                // model - view
                scope.$watch('ngModel', function (newVal) {
                    // 跳过ajax方式以及多选情况
                    if(config.ajax || config.multiple) { return false }

                    $element.select2('val', newVal);
                }, true);
            }
        }
    }
});

/**
 * select2 内置查询功能
 */
app.factory('select2Query', function ($timeout) {
    return {
        testAJAX: function () {
            var config = {
                minimumInputLength: 1,
                ajax: {
                    url: "http://api.rottentomatoes.com/api/public/v1.0/movies.json",
                    dataType: 'jsonp',
                    data: function (term) {
                        return {
                            q: term,
                            page_limit: 10,
                            apikey: "ju6z9mjyajq2djue3gbvv26t"
                        };
                    },
                    results: function (data, page) {
                        return {results: data.movies};
                    }
                },
                formatResult: function (data) {
                    return data.title;
                },
                formatSelection: function (data) {
                    return data.title;
                }
            };

            return config;
        }
    }
});

app.controller('appCtrl', function ($scope, $timeout) {
    $scope.config1 = {
        data: [],
        placeholder: '尚无数据'
    };

    $timeout(function () {
        $scope.config1.data = [{id:1,text:'bug'},{id:2,text:'duplicate'},{id:3,text:'invalid'},{id:4,text:'wontfix'}]
        $scope.config1.placeholder = '加载完毕'
    }, 1000);


    $scope.config2 = [
        {id: 6, text: '来自ng-repeat'},
        {id: 7, text: '来自ng-repeat'},
        {id: 8, text: '来自ng-repeat'}
    ];

    $scope.config3 = {
        data: [{id:1,text:'bug'},{id:2,text:'duplicate'},{id:3,text:'invalid'},{id:4,text:'wontfix'}]
        // 其他配置略，可以去看看内置配置中的ajax配置
    };

});

angular.bootstrap(document, ['app']);
