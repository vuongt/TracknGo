angular.module('starter.controllers').controller('MusiqueCtrl', function($scope, $http, $stateParams,$state, $ionicPopup, $ionicHistory){
  $scope.iswc = $stateParams.iswc;
  $scope.title = $stateParams.title;
  $scope.myGoBack = function() {window.history.back()  };
$http({
  method: 'GET',
  url: 'http://localhost:8080/work?iswc='+$scope.iswc,
  header:{
    Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {
    $scope.answer = response.data;
    if ($scope.answer.error == ""){
      $scope.title=$scope.answer.title.charAt(0).toUpperCase()+ $scope.answer.title.substring(1).toLowerCase();
      for(var i = 0, len = $scope.answer.composerAuthor.length; i < len; i++) {
        var temp = $scope.answer.composerAuthor[i].trim();
        $scope.answer.composerAuthor[i] = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
      }
      $scope.isArtist=false;
      if ($scope.answer.performer.length != 0)
          {
          $scope.isArtist=true;
          }
      for(var i = 0, len = $scope.answer.performer.length; i < len; i++) {
        var temp = $scope.answer.performer[i].trim();
        $scope.answer.performer[i] = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
      }
      console.log($scope.answer);
    } else {
      //Show an alert of the error
      var alertPopup = $ionicPopup.alert({
        title: "Error !",
        template: $scope.answer.error
      });
      alertPopup.then(function(res) {
        console.log($scope.answer.error);
      });
      console.log($scope.answer);
    }
  }, function errorCallback(response) {
// FAIRE UNE DISTINCTION ICI EN FONCTION DU TYPE DERREUR RECUE
  });

/*  $scope.printMore = function() {
$scope.numLimit=$scope.numLimit+5;
$route.reload();
  };*/


  $scope.myGoBack = function() {
$ionicHistory.goBack();
  };
});

