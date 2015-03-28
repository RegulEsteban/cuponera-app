angular.module('cuponeraApp', ['ionic', 'cuponeraApp.controllers', 'cuponeraApp.services', 'ngResource', 'ui.bootstrap'])
.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInCtrl'
    })
    .state('forgotpassword', {
      url: '/forgot-password',
      templateUrl: 'templates/forgot-password.html'
    })
    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html',
      controller: 'MapCtrl'
    })
    .state('tabs.home', {
      url: '/home',
      views: {
        'home-tab': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'CuponesCtrl'
        }
      }
    })
    .state('tabs.maps', {
      url: '/maps',
      views: {
        'maps-tab': {
          templateUrl: 'templates/tab-map.html'
        }
      }
    })
    .state('tabs.facts', {
      url: '/facts',
      views: {
        'home-tab': {
          templateUrl: 'templates/facts.html'
        }
      }
    })
    .state('tabs.facts2', {
      url: '/facts2',
      views: {
        'home-tab': {
          templateUrl: 'templates/facts2.html'
        }
      }
    })
    .state('tabs.about', {
      url: '/about',
      views: {
        'about-tab': {
          templateUrl: 'templates/about.html',
          controller: 'FavoritosCtrl'
        }
      }
    })
    .state('tabs.navstack', {
      url: '/navstack',
      views: {
        'about-tab': {
          templateUrl: 'templates/nav-stack.html'
        }
      }
    });
   $urlRouterProvider.otherwise('/sign-in');
})
;
