angular.module('cuponService', ['ngResource']).
factory('Usuario', function($resource) {
    return $resource('usuarios/:usuarioId', {}, {
        query: { method: 'GET', params: { usuarioId: 'usuarios' }, isArray: true }
  });
}).
factory('Cupon', function($resource) {
	return $resource('cuponera/:cuponId', {}, {
		query: { method: 'GET', params: { cuponId: 'cuponera' }, isArray: true }
  });
}).
factory('ImagenCupon', function($resource) {
  return $resource('/:imagenId', {}, {
	  query: { method: 'GET', params: { imagenId: 'imagenes' }, isArray: true }
  });
}).
factory('socket', function($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
})
.factory("fileReader", ["$q", "$log", function ($q, $log) {
    var onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };
    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };
    var onProgress = function(reader, scope) {
        return function (event) {
            scope.$broadcast("fileProgress",
            {
                total: event.total,
                loaded: event.loaded
            });
        };
    };
   var getReader = function(deferred, scope) {
       var reader = new FileReader();
       reader.onload = onLoad(reader, deferred, scope);
       reader.onerror = onError(reader, deferred, scope);
       reader.onprogress = onProgress(reader, scope);
       return reader;
   };
   var readAsDataURL = function (file, scope) {
       var deferred = $q.defer();
        
       var reader = getReader(deferred, scope);         
       reader.readAsDataURL(file);
        
       return deferred.promise;
   };
   return {readAsDataUrl: readAsDataURL};
}]);