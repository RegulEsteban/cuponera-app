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
}])
.factory('API', function ($rootScope, $http, $window, $resource) {
    var base = "";

    $rootScope.logout = function () {
        $rootScope.setToken("");
        $window.location.href = '#/login';
    };

    $rootScope.setToken = function (token) {
        return $window.localStorage.token = token;
    };
    
    $rootScope.getToken = function () {
        return $window.localStorage.token;
    };
    
    $rootScope.isSessionActive = function () {
        return $window.localStorage.token ? true : false;
    };
    
    $rootScope.getVisor = function(){
        return "VIZOR";
    };
    
    $rootScope.getProv = function(){
        return "PROVEEDOR";
    };
    
    return {
        getBase: function () {
            return base;
        },
        signin: function (form) {
            return $http.post(base+'/auth/login', form, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        },
        signup: function (form) {
            return $http.post(base+'/api/v1/bucketList/auth/register', form);
        },
        getAll: function (email) {
            return $http.get(base+'/api/v1/bucketList/data/list', {
                method: 'GET',
                params: {
                    token: email
                }
            });
        },
        getOne: function (id, email) {
            return $http.get(base+'/api/v1/bucketList/data/item/' + id, {
                method: 'GET',
                params: {
                    token: email
                }
            });
        },
        saveItem: function (form, email) {
            return $http.post(base+'/api/v1/bucketList/data/item', form, {
                method: 'POST',
                params: {
                    token: email
                }
            });
        },
        putItem: function (id, form, email) {
            return $http.put(base+'/api/v1/bucketList/data/item/' + id, form, {
                method: 'PUT',
                params: {
                    token: email
                }
            });
        },
        getCupones: function () {
            return $resource(base+'/imagenesMovil');
        },
        getUbicaciones: function () {
            return $resource(base+'/getAllUbicaciones');
        },
        getCuponById: function () {
            return $resource(base+'/getCuponById/:id', {id:'@id'});
        },
        getUbicacionesByUser: function () {
            return $resource(base+'/getAllUbicaciones/:id', {id:'@id'});
        },
        getUserById: function () {
            return $resource(base+'/usuarios/:id', {id:'@id'});
        },
        getFavoritos: function () {
            return $resource(base+'/getFavoritos');
        }
    };
})
;