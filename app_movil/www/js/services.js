angular.module('cuponeraApp.services', ['ngResource'])
.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})
.factory('API', function ($rootScope, $http, $ionicLoading, $window, $resource) {
    var base = "http://localhost:3000";
    $rootScope.show = function (text) {
        $rootScope.loading = $ionicLoading.show({
            content: text ? text : 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    };

    $rootScope.hide = function () {
        $ionicLoading.hide();
    };

    $rootScope.logout = function () {
        $rootScope.setToken("");
        $window.location.href = '#/auth/signin';
    };

    $rootScope.notify =function(text){
        $rootScope.show(text);
        $window.setTimeout(function () {
            $rootScope.hide();
        }, 1999);
    };

    $rootScope.doRefresh = function (tab) {
        if(tab === 1)
            $rootScope.$broadcast('fetchAll');
        else
            $rootScope.$broadcast('fetchCompleted');

        $rootScope.$broadcast('scroll.refreshComplete');
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

    return {
        getBase: function () {
            return base;
        },
        signin: function (form) {
            return $http.post(base+'/api/v1/bucketList/auth/login', form);
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
        getFavoritos: function () {
            return $resource(base+'/getFavoritos');
        }
    };
})
;
