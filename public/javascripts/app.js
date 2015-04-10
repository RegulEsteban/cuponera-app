angular.module('cuponeraApp',['ngRoute', 'ngMessages', 'satellizer', 'cuponService', 'uiGmapgoogle-maps', 'ui.bootstrap','mgcrea.ngStrap'])
    .config(['$routeProvider', function($routeProvider, $authProvider){
	$routeProvider.
		when('/cuponera2', {
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
		when('/cuponera', {
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
        when('/login', {
            templateUrl: 'vistas/login.html',
            controller: SignInControlller
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
.config(function($alertProvider) {
    angular.extend($alertProvider.defaults, {
        animation: 'am-fade-and-slide-top',
        placement: 'top'
    });
})
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
            markers: [],
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
.directive("bnLazySrc", function( $window, $document ) { 
    // I manage all the images that are currently being
    // monitored on the page for lazy loading.
    var lazyLoader = (function() {
 
        // I maintain a list of images that lazy-loading
        // and have yet to be rendered.
        var images = [];
     
        // I define the render timer for the lazy loading
        // images to that the DOM-querying (for offsets)
        // is chunked in groups.
        var renderTimer = null;
        var renderDelay = 100;
     
        // I cache the window element as a jQuery reference.
        var win = $( $window );
     
        // I cache the document document height so that
        // we can respond to changes in the height due to
        // dynamic content.
        var doc = $document;
        var documentHeight = doc[0].body.clientHeight;
        var documentTimer = null;
        var documentDelay = 2000;
     
        // I determine if the window dimension events
        // (ie. resize, scroll) are currenlty being
        // monitored for changes.
        var isWatchingWindow = false;
       
        // I start monitoring the given image for visibility
        // and then render it when necessary.
        function addImage( image ) {
            images.push( image );
     
            if ( ! renderTimer ) {       
                startRenderTimer();
            }

            if ( ! isWatchingWindow ) {
                startWatchingWindow();
            }
        }
     
        // I remove the given image from the render queue.
        function removeImage( image ) {
            // Remove the given image from the render queue.
            for ( var i = 0 ; i < images.length ; i++ ) {
             
                if ( images[ i ] === image ) {
                    images.splice( i, 1 );
                    break;
                }
            }
     
            // If removing the given image has cleared the
            // render queue, then we can stop monitoring
            // the window and the image queue.
            if ( ! images.length ) {         
                clearRenderTimer();
                stopWatchingWindow();
            }
     
        }

        // I check the document height to see if it's changed.
        function checkDocumentHeight() {
     
            // If the render time is currently active, then
            // don't bother getting the document height -
            // it won't actually do anything.
            if ( renderTimer ) {         
                return;
            }
     
            var currentDocumentHeight = doc[0].body.clientHeight;
     
            // If the height has not changed, then ignore -
            // no more images could have come into view.
            if ( currentDocumentHeight === documentHeight ) {
                return;
            }
     
            // Cache the new document height.
            documentHeight = currentDocumentHeight;
            startRenderTimer();
        }
     
        // I check the lazy-load images that have yet to
        // be rendered.
        function checkImages() {
        
            // Log here so we can see how often this
            // gets called during page activity.
            console.log( "Checking for visible images..." );
     
            var visible = [];
            var hidden = [];
     
            // Determine the window dimensions.
            var windowHeight = win.height();
            var scrollTop = win.scrollTop();
     
            // Calculate the viewport offsets.
            var topFoldOffset = scrollTop;
            var bottomFoldOffset = ( topFoldOffset + windowHeight );
     
            // Query the DOM for layout and seperate the
            // images into two different categories: those
            // that are now in the viewport and those that
            // still remain hidden.
            for ( var i = 0 ; i < images.length ; i++ ) {
                var image = images[ i ];
//                if ( image.isVisible( topFoldOffset, bottomFoldOffset ) ) {
//                    visible.push( image );
//                } else {
//                    hidden.push( image );
//                }
                
                visible.push( image );
            }
     
            // Update the DOM with new image source values.
            for ( var i = 0 ; i < visible.length ; i++ ) {
                visible[ i ].render();
            }
     
            // Keep the still-hidden images as the new
            // image queue to be monitored.
            images = hidden;
     
            // Clear the render timer so that it can be set
            // again in response to window changes.
            clearRenderTimer();
     
            // If we've rendered all the images, then stop
            // monitoring the window for changes.
            if ( ! images.length ) {
                stopWatchingWindow();
            }
        }
     
        // I clear the render timer so that we can easily
        // check to see if the timer is running.
        function clearRenderTimer() {    
            clearTimeout( renderTimer );
            renderTimer = null;
        }
     
        // I start the render time, allowing more images to
        // be added to the images queue before the render
        // action is executed.
        function startRenderTimer() {    
            renderTimer = setTimeout( checkImages, renderDelay );
        }
     
        // I start watching the window for changes in dimension.
        function startWatchingWindow() {     
            isWatchingWindow = true;
         
            // Listen for window changes.
            win.on( "resize.bnLazySrc", windowChanged );
            win.on( "scroll.bnLazySrc", windowChanged );
         
            // Set up a timer to watch for document-height changes.
            documentTimer = setInterval( checkDocumentHeight, documentDelay );   
        }
     
        // I stop watching the window for changes in dimension.
        function stopWatchingWindow() {
            isWatchingWindow = false;
         
            // Stop watching for window changes.
            win.off( "resize.bnLazySrc" );
            win.off( "scroll.bnLazySrc" );
         
            // Stop watching for document changes.
            clearInterval( documentTimer );  
        }
     
        // I start the render time if the window changes.
        function windowChanged() {
            if ( ! renderTimer ) {
                startRenderTimer();
            }
        }
     
        // Return the public API.
        return({
            addImage: addImage,
            removeImage: removeImage
        });
    })();
 
    // I represent a single lazy-load image.
    function LazyImage( element ) {
 
        // I am the interpolated LAZY SRC attribute of
        // the image as reported by AngularJS.
        var source = null;

        // I determine if the image has already been
        // rendered (ie, that it has been exposed to the
        // viewport and the source had been loaded).
        var isRendered = false;

        // I am the cached height of the element. We are
        // going to assume that the image doesn't change
        // height over time.
        var height = null;
 
        // I determine if the element is above the given
        // fold of the page.
        function isVisible( topFoldOffset, bottomFoldOffset ) {
 
            // If the element is not visible because it
            // is hidden, don't bother testing it.
            if ( ! element.is( ":visible" ) ) {
                return( false );
            }
     
            // If the height has not yet been calculated,
            // the cache it for the duration of the page.
            if ( height === null ) {
                height = element.height();
            }
     
            // Update the dimensions of the element.
            var top = element.offset().top;
            var bottom = ( top + height );
     
            // Return true if the element is:
            // 1. The top offset is in view.
            // 2. The bottom offset is in view.
            // 3. The element is overlapping the viewport.
            return(
                (
                    ( top <= bottomFoldOffset ) &&
                    ( top >= topFoldOffset )
                )
                ||
                (
                    ( bottom <= bottomFoldOffset ) &&
                    ( bottom >= topFoldOffset )
                )
                ||
                (
                    ( top <= topFoldOffset ) &&
                    ( bottom >= bottomFoldOffset )
                )
            );
 
        }
 
        // I move the cached source into the live source.
        function render() {
            isRendered = true;
            renderSource();
        }
 
        // I set the interpolated source value reported
        // by the directive / AngularJS.
        function setSource( newSource ) {
            source = newSource;
            if ( isRendered ) {
                renderSource();
            }
        }
        
        // I load the lazy source value into the actual
        // source value of the image element.
        function renderSource() {
            element[ 0 ].src = source;
        }
 
        // Return the public API.
        return({
            isVisible: isVisible,
            render: render,
            setSource: setSource
        });
    }
 
    // I bind the UI events to the scope.
    function link( $scope, element, attributes ) {
        var lazyImage = new LazyImage( element );
 
        // Start watching the image for changes in its
        // visibility.
        lazyLoader.addImage( lazyImage );
  
        // Since the lazy-src will likely need some sort
        // of string interpolation, we don't want to
        attributes.$observe("bnLazySrc",function( newSource ) {
            lazyImage.setSource( newSource );
        });
 
        // When the scope is destroyed, we need to remove
        // the image from the render queue.
        $scope.$on("$destroy", function() {
            lazyLoader.removeImage( lazyImage );
        });
    }
 
    // Return the directive configuration.
    return({
        link: link,
        restrict: "A"
    });
})
;