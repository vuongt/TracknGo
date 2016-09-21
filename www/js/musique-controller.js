angular.module('starter.controllers').controller('MusiqueCtrl', ['$rootScope', '$scope', '$http', "$stateParams", "$state", function($rootScope, $scope, $http, $stateParams){
  $scope.iswc = $stateParams.iswc;
  $scope.myGoBack = function() {
    window.history.back()  };
$http({
  method: 'GET',
  url: 'http://localhost:8080/work?iswc='+$scope.iswc,
  header:{
    Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {
    $scope.answer = response.data;
    if ($scope.answer.error ==""){
      $scope.title=$scope.answer.title.charAt(0).toUpperCase()+ $scope.answer.title.substring(1).toLowerCase();
      for(var i = 0, len = $scope.answer.performer.length; i < len; i++) {
        var temp = $scope.answer.performer[i];
        $scope.answer.performer[i] = temp.charAt(0).toUpperCase()+temp.substring(1).toLowerCase();
      }
    } else {
      //Show an alert of the error
      var alertPopup = $ionicPopup.alert({
        title: "Error !",
        template: $scope.error
      });
      alertPopup.then(function(res) {
        console.log($scope.error);
      });
    }
  }, function errorCallback(response) {
// FAIRE UNE DISTINCTION ICI EN FONCTION DU TYPE DERREUR RECUE
  });

  $scope.printMore = function() {
$scope.numLimit=$scope.numLimit+5;
$route.reload();
  };


  $scope.myGoBack = function() {
window.history.back()  };


}]);

