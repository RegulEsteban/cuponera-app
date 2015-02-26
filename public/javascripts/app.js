angular.module('cuponeraApp',['ngRoute', 'flow', 'cuponService']).
	config(['$routeProvider', function($routeProvider){
	$routeProvider.
		when('/cuponera', {
			templateUrl: 'vistas/list.html',
			controller: CuponListController
		}).
		when('/cuponera/:cuponId', {
			templateUrl: 'vistas/item.html',
			controller: CuponItemController
		}).
		when('/new', {
			templateUrl: 'vistas/new.html',
			controller: CuponNewController
		}).
		when('/upload', {
			templateUrl: 'vistas/upload.html',
			controller: CuponUploadController
		}).
		when('/imagenes', {
			templateUrl: 'vistas/listImages.html',
			controller: CuponImagenController
		}).
		when('/nuevoUsuario', {
            templateUrl: 'vistas/nuevoUsuario.html',
            controller: UsuariosController
        }).
        when('/usuarios', {
            templateUrl: 'vistas/usuariosList.html',
            controller: UsuariosListController
        }).
        when('/nuevoCupon', {
            templateUrl: 'vistas/nuevoCupon.html',
            controller: CuponUploadController
        }).
		otherwise({
			redirectTo: '/cuponera'
		});
	}
])
.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])
.directive(['$sce', function($sce) {
    return function(scope, element, attr) {
      scope.$watch($sce.parseAsHtml(attr.ngBindHtml), function(value) {
          element.html(value || '');
      });
    };
}])
//.config(['flowFactoryProvider', function (flowFactoryProvider) {
//    flowFactoryProvider.defaults = {
//        target: '/upload',
//        permanentErrors: [404, 500, 501],
//        maxChunkRetries: 1,
//        chunkRetryInterval: 5000,
//        simultaneousUploads: 4,
//        singleFile: true
//	};
//	flowFactoryProvider.on('catchAll', function (event) {
//	  console.log('catchAll', arguments);
//	});
//}])
;