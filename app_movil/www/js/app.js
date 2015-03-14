angular.module('cuponeraApp', ['ionic', 'cuponeraApp.controllers', 'cuponeraApp.services', 'ngResource'])
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
    .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })
    .state('tab.dash', {
        url: '/dash',
        views: {
            'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
            }
        }
    })
    .state('tab.chats', {
        url: '/chats',
        views: {
            'tab-chats': {
            templateUrl: 'templates/tab-chats.html',
            controller: 'ChatsCtrl'
            }
        }
    })
    .state('tab.chat-detail', {
        url: '/chats/:chatId',
        views: {
            'tab-chats': {
            templateUrl: 'templates/chat-detail.html',
            controller: 'ChatDetailCtrl'
            }
        }
    })
    .state('tab.account', {
        url: '/account',
        views: {
        'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
            }
        }
    });
    $urlRouterProvider.otherwise('/tab/dash');
});
