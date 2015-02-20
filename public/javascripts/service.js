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
	  query: { method: 'GET', params: { imagenId: 'imagenes' }, isArray: true, headers : {'Content-Type' : 'application/json'} }
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
      })
    }
  };
});