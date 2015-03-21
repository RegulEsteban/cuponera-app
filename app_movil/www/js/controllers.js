angular.module('cuponeraApp.controllers', [])
.controller('CuponesCtrl', function($scope, $timeout, $ionicModal, $http, API) {
    $scope.cupones = API.getCupones().query();
    $scope.doRefresh = function() {
        $timeout( function() {
          $scope.cupones = API.getCupones().query();
          $scope.$broadcast('scroll.refreshComplete');
        }, 1000);
    };
    $scope.actionComent = function(cupon){        
        $ionicModal.fromTemplateUrl('templates/modal.html', function(modal) {
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
    
    $scope.doComment = function(id, coment, list){
        var fd = new FormData();
        fd.append('id_cupon', id);
        fd.append('comentario', coment);
        fd.append('fecha', new Date());
        $http.post('http://localhost:3000/comentar', fd, {
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
.controller('HomeTabCtrl', function($scope) {
  console.log('HomeTabCtrl');
})
.controller('MapCtrl', function($scope, $ionicLoading, $compile, $window) { 
      $scope.init = function() {
        var myLatlng = new google.maps.LatLng(43.07493,-89.381388);
        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        var map = new google.maps.Map(document.getElementById("map"),mapOptions);

        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Clicca qui!</a></div>";
        var compiled = $compile(contentString)($scope);
        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });
        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'Uluru (Ayers Rock)'
        });
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });
        $scope.map = map;
    };
    // google.maps.event.addDomListener(window, 'load', initialize);
    $scope.centerOnMe = function() {
        if(!$scope.map) {return;}

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
    };
    $scope.clickTest = function() {
        alert('Example of infowindow with ng-click');
    };
})
;
