angular.module('cuponeraApp',['ngRoute', 'ngMessages', 'satellizer', 'cuponService', 'uiGmapgoogle-maps', 'ui.bootstrap'])
    .config(['$routeProvider', function($routeProvider, $authProvider){
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
			templateUrl: 'vistas/listCupones.html',
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
        when('/nuevoProveedor', {
            templateUrl: 'vistas/nuevoProveedor.html',
            controller: ProveedorController
        }).
        when('/addUbicaciones', {
            templateUrl: 'vistas/agregarUbicaciones.html',
            controller: CuponesController
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
.directive("ngFileSelect",function(){
  return {
    link: function($scope,el){
      el.bind("change", function(e){
        $scope.file = (e.srcElement || e.target).files[0];
        $scope.getFile();
      });
    }
  };
})
.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
  GoogleMapApi.configure({
    key: 'AIzaSyDbqmC8F6dWSfD4c3n5zZgbQx7_XB3A6Sg',
    v: '3.17',
    libraries: 'weather,geometry,visualization'
  });
}])
.filter('slice', function() {
  return function(arr, start, end) {
    return arr.slice(start, end);
  };
})
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
.controller("CuponesController",['$scope', '$timeout', 'uiGmapLogger', '$http','uiGmapGoogleMapApi', '$location'
    , function ($scope, $timeout, $log, $http, GoogleMapApi, $location) {
    $scope.location = $location;
    
    $scope.proveedor = {ubicaciones: [{lat: '', lon: '', direccion: '', status: true}]};
    $scope.i = 0;
    
    $scope.agregarUbicacion = function(){
        $scope.proveedor.ubicaciones.push({lat: '', lon: '', direccion: ''});
        $scope.map.markers.push($scope.map.clickedMarker);
        $scope.i = $scope.i + 1;
    };
    $scope.oneAtATime = true;    
    
    var directionsService = new google.maps.DirectionsService(),
                     marker=new google.maps.Marker();
    
    GoogleMapApi.then(function(maps) {
        $scope.googleVersion = maps.version;
        maps.visualRefresh = true;
    });

    var onMarkerClicked = function (marker) {
        marker.showWindow = true;
        $scope.$apply();
    };

    angular.extend($scope, {
        map: {
            show: true,
            control: {},
            version: "3.17",
            heatLayerCallback: function (layer) {
                var mockHeatLayer = new MockHeatLayer(layer);
            },
            showTraffic: false,
            showBicycling: false,
            showWeather: false,
            showHeat: false,
            center: {
                latitude: 19.2878,
                longitude: -99.6474
            },
            options: {
                streetViewControl: false,
                panControl: false,
                maxZoom: 20,
                minZoom: 3
            },
            zoom: 12,
            dragging: false,
            bounds: {},
            markers: [{
                id: 1,
                latitude: 19,
                longitude: -99,
                showWindow: false,
                options: {
                    animation: 2,
                    labelContent: 'Markers id 1',
                    labelAnchor: "22 0",
                    labelClass: "marker-labels"
                }
            },{
                id: 2,
                latitude: 15,
                longitude: 30,
                showWindow: false,
                options: {
                    labelContent: 'Markers id 2',
                    labelAnchor: "26 0",
                    labelClass: "marker-labels"
                }
            },{
                id: 3,
                icon: 'assets/images/plane.png',
                latitude: 37,
                longitude: -122,
                showWindow: false,
                title: 'Plane',
                options: {
                    labelContent: 'Markers id 3',
                    labelAnchor: "26 0",
                    labelClass: "marker-labels"
                }
            }],
            clickMarkers: [],
            dynamicMarkers: [],
            randomMarkers: [],
            doClusterRandomMarkers: true,
            clickedMarker: {
                id: 0,
                options:{
                }
            },
            
            events: {
                tilesloaded: function (map, eventName, originalEventArgs) {
                },
                click: function (mapModel, eventName, originalEventArgs) {
                    // 'this' is the directive's scope
                  var e = originalEventArgs[0];
                  var lat = e.latLng.lat(),
                  lon = e.latLng.lng();
                  var request = {
                      origin: new google.maps.LatLng(lat,lon),
                      destination: new google.maps.LatLng(lat,lon),
                      travelMode: google.maps.DirectionsTravelMode.DRIVING
                  };
                  directionsService.route(request, function(response, status) {
                      if (status === google.maps.DirectionsStatus.OK) {
                          var point=response.routes[0].legs[0];
                          $scope.proveedor.ubicaciones[$scope.i] = {lat: lat, lon: lon, direccion: response.routes[0].summary, status: true};
                          $scope.$apply();
                      }
                  });
                  $scope.map.center = {
                      latitude: lat,
                      longitude: lon
                  };
                  $scope.map.clickedMarker = {
                      id: 0,
                      options: {
                          animation: 2,
                          labelContent: "<div class='alert alert-success' role='alert' >" +
                          		            "<p><strong>" +
                          		                'Latitud: ' + lat + '<br/>' +
                          		                'Longitud: ' + lon + '<br/>' +
                          		            "</strong></p>" +
                          		        "</div>",
                          labelAnchor:"100 100"
                      },
                      latitude: lat,
                      longitude: lon
                  };
                  $scope.$apply();
                }
            }
        },
        toggleColor: function (color) {
            return color === 'red' ? '#6060FB' : 'red';
        }
    });

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = new google.maps.LatLng(position.coords.latitude,
                                           position.coords.longitude);
          $scope.map.center = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
              };
          $scope.$apply();
        });
      } else {
        alert("Browser doesn't support Geolocation");
      }
    
    $scope.removeMarkers = function () {

        $scope.map.markers = [];
        $scope.map.markers2 = [];
        $scope.map.dynamicMarkers = [];
        $scope.map.randomMarkers = [];
        $scope.map.mexiMarkers = [];
        $scope.map.clickMarkers = [];
        $scope.map.polylines = [];
        $scope.map.polygons = [];
        $scope.map.polygons2 = [];
        $scope.map.circles = [];
        $scope.map.rectangle = null;
        $scope.map.clickedMarker = null;
        $scope.staticMarker = null;
        $scope.map.infoWindow.show = false;
        $scope.map.templatedInfoWindow.show = false;
        $scope.map.templatedInfoWindow.coords = null;
        $scope.map.infoWindowWithCustomClass.show = false;
        $scope.map.infoWindowWithCustomClass.coords = null;
        $scope.map.infoWindow.show = false;
        $scope.map.infoWindow.coords = null;
    };
    
    $scope.refreshMap = function () {
        $scope.map.control.refresh({latitude: 32.779680, longitude: -79.935493});
        $scope.map.control.getGMap().setZoom(11);
        return;
    };

    $scope.onMarkerClicked = onMarkerClicked;
    
    $scope.addUbicaciones = function(){
        var ubicaciones = $scope.proveedor;
        var fd = new FormData();
        fd.append('ubicaciones', angular.toJson(ubicaciones));
        
        $http.post('/addUbicaciones', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data) {
            alert('¡Ubicaiones Guardadas!');
            $location.path('/cuponera');
        })
        .error(function(data) {
            console.log('Error: '+data);
        });
    };
}])
;