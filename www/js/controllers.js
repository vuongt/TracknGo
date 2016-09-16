angular.module('starter.controllers')

.controller('HomeCtrl', function($scope) {})


.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})



.controller('AlbumCtrl', function($scope, $stateParams, Chats) {
});


