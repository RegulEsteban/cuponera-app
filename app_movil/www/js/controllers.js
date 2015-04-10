angular.module('cuponeraApp.controllers', ['ionic'])
.controller('CuponesCtrl', function($scope, $timeout, $ionicModal, $http, API, $rootScope) {
    $scope.cupones = API.getCupones().query();
    $scope.doRefresh = function() {
        $timeout( function() {
          $scope.cupones = API.getCupones().query();
          $scope.$broadcast('scroll.refreshComplete');
        }, 800);
    };
    $scope.actionComent = function(cupon){        
        $ionicModal.fromTemplateUrl('templates/modal.html', function(modal) {
            for(var i=0; i<cupon.favoritos.length;i++){
                if(cupon.favoritos[i].id_usuario===$rootScope.getToken()){
                    modal.isFav = 1;
                    break;
                }
            }
            modal.start = 0;
            modal.end = 5;
            modal.cupon = cupon;
            $scope.modal = modal;
            $scope.modal.show();
          }, {
            scope: $scope,
            animation: 'slide-in-up'
          });
    };
    
    $scope.closeModal = function(){
        $scope.modal.remove();
    };
    
    $scope.doComment = function(id, coment, list){
        var fd = new FormData();
        fd.append('id_cupon', id);
        fd.append('comentario', coment);
        fd.append('fecha', new Date());
        fd.append('id_usuario', $rootScope.getToken());
        $http.post(API.getBase()+'/comentar', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data) {
            $scope.comentario = '';
            list.push(data);
            $scope.modal.end = $scope.modal.end + 1;
        })
        .error(function(data) {
            console.log('Error: '+data);
        });
    };
    
    $scope.addToFav = function(cupon){
        var fd = new FormData();
        fd.append('id_cupon', cupon._id);
        fd.append('id_usuario', $rootScope.getToken());
        $http.post(API.getBase()+'/doFavorito', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data) {
           $scope.modal.isFav = 1;
        })
        .error(function(data) {
            console.log('Error: '+data);
        });
    };
})
.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})
.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})
.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})
.controller('SignInCtrl', function($scope, $state) {
  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    $state.go('tabs.home');
  };
})
.controller('FavoritosCtrl', function($scope, $window, API, $rootScope, $ionicSlideBoxDelegate, $ionicModal) {
    var m_names = new Array("Enero", "Febrero", "Marzo","Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre","Octubre", "Noviembre", "Diciembre");
    $scope.cupones = [];
    $scope.favoritos = API.getFavoritos().query();
    $scope.favoritos.$promise.then(function(data) {
        for (var i=0; i < data.length; i=i+1){
            for(var j=0;j<data[i].favoritos.length;j++){
                if(data[i].favoritos[j].id_usuario===$rootScope.getToken()){
                    $scope.cupones.push(data[i]);
                }
            }
        }
    });
    
    $ionicModal.fromTemplateUrl('image-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    
    $scope.$on('modal.hide', function() {
        // Execute action
    });
    
    $scope.$on('modal.removed', function() {
        // Execute action
    });
    $scope.$on('modal.shown', function() {
        
    });
    
    $scope.next = function() {
        $ionicSlideBoxDelegate.next();
    };
    
    $scope.previous = function() {
        $ionicSlideBoxDelegate.previous();
    };
    
    $scope.goToSlide = function(index) {
        $scope.modal.show();
        $ionicSlideBoxDelegate.slide(index);
    };
    
      // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };
    
})
.controller('MapCtrl', function($scope, $http, $ionicLoading, $ionicModal, $compile, $window, API, $rootScope) {
    $scope.$on('$ionicView.afterEnter', function(){
       if ( angular.isDefined( $scope.map ) ) {
          google.maps.event.trigger($scope.map, 'resize');
       }
    });
        
    $scope.init = function() {
        var myLatlng = new google.maps.LatLng(43.07493,-89.381388);
        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        var map = new google.maps.Map(document.getElementById("map"),mapOptions);

        var infowindow = {};        
        var marker = {};
        
//        google.maps.event.addListener(marker, 'click', function() {
//          infowindow.open(map,this);
//        });
        var infowindow = new google.maps.InfoWindow({
            content: ''
        });
        
        $scope.ubicaciones = API.getUbicaciones().query();
        $scope.ubicaciones.$promise.then(function(data) {
            for(var cupon in data){
                if(data[cupon].id_usuario){
                    for(var j=0;j<data[cupon].id_usuario.ubicaciones.length;j++){
                        var c = data[cupon]._id;
                        var contentString = '<div class="infobox">'+"<img ng-src='"+data[cupon].binaryImage+"' class='image-thum' "+'ng-click="clickTest(\'' + c + '\')"'+"/>"+'</div>';
                        var compiled = $compile(contentString)($scope);
                        marker = new google.maps.Marker({
                            position: new google.maps.LatLng(data[cupon].id_usuario.ubicaciones[j].lat,data[cupon].id_usuario.ubicaciones[j].lon),
                            map: map,
                            icon: 'img/departmentstore.png',
                            title: data[cupon].id_usuario.empresa,
                            animation: 2,
                            info: compiled[0]
                        });
                        
                        google.maps.event.addListener(marker, 'click', function() {
                            infowindow.setContent(this.info);
                            infowindow.open(map,this);
                        });
                    }
                }
            }
        });
        
        $scope.map = map;
    };

    $scope.centerOnMe = function() {
        if(!$scope.map) {return;}

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: true
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
    };
    $scope.clickTest = function(cupon) {
        $scope.cupon = API.getCuponById().get({id: cupon});
        $scope.cupon.$promise.then(function(data) {
            $ionicModal.fromTemplateUrl('templates/modal.html', function(modal) {
              for(var i=0; i<data.favoritos.length;i++){
                  if(data.favoritos[i].id_usuario===$rootScope.getToken()){
                      modal.isFav = 1;
                      break;
                  }
              }
              modal.start = 0;
              modal.end = 5;
              modal.cupon = data;
              $scope.modal = modal;
              $scope.modal.show();
            }, {
              scope: $scope,
              animation: 'slide-in-up'
            });
        });
    };
    
    $scope.closeModal = function(){
        $scope.modal.remove();
    };
    
    $scope.doComment = function(id, coment, list){
        var fd = new FormData();
        fd.append('id_cupon', id);
        fd.append('comentario', coment);
        fd.append('fecha', new Date());
        fd.append('id_usuario', $rootScope.getToken());
        $http.post(API.getBase()+'/comentar', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data) {
            $scope.comentario = '';
            list.push(data);
            $scope.modal.end = $scope.modal.end + 1;
        })
        .error(function(data) {
            console.log('Error: '+data);
        });
    };
    
    $scope.addToFav = function(cupon){
        var fd = new FormData();
        fd.append('id_cupon', cupon._id);
        fd.append('id_usuario', $rootScope.getToken());
        $http.post(API.getBase()+'/doFavorito', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data) {
           $scope.modal.isFav = 1;
        })
        .error(function(data) {
            console.log('Error: '+data);
        });
    };
})
.controller('SignInCtrl', function ($rootScope, $scope, API, $window, $ionicPopup, $timeout) {
    // if the user is already logged in, take him to his bucketlist
    if ($rootScope.isSessionActive()) {
        $window.location.href = ('#/tab/home');
    }

    $scope.user = {
        email: "",
        password: ""
    };
    $scope.showAlert = function() {
        
      };
    $scope.validateUser = function () {
        var email = this.user.email;
        var password = this.user.password;
        if(!email) {
            $rootScope.alert('¡Datos Incorrectos!',"El campo 'Email' es incorrecto.");
            return false;
        }else if(!password){
            $rootScope.alert('¡Datos Incorrectos!',"El campo 'Password' es incorrecto.");
            return false;
        }
        $rootScope.show('Please wait.. Authenticating');
        var fd = new FormData();
        fd.append('email', email);
        fd.append('password', password);
        API.signin(fd).success(function (data) {
            if(!data.error){
                $rootScope.setToken(data._id); // create a session kind of thing on the client side
                $rootScope.hide();
                $window.location.href = ('#/tab/home');
            }else{
                $rootScope.hide();
                $rootScope.alert('¡Error!',data.error);
            }
            
        }).error(function (error) {
            $rootScope.hide();
            $rootScope.alert('¡Error!','Usuario y/o password incorrectos.');
        });
    };

})
;
