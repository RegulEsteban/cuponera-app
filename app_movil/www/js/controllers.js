angular.module('cuponeraApp.controllers', [])

.controller('DashCtrl', function($scope, Chats, API) {
    $scope.chats = Chats.all();
    API.getCupones().success(function (data, status, headers, config) {
        console.log("Exitoooooooooooooo: "+data);
    }).error(function (data, status, headers, config) {
        console.log(":'( "+data);
    });
})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
