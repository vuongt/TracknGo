angular.module('starter.controllers').controller('MusiqueCtrl', ['$rootScope', '$scope', '$http', "$stateParams", "$state", function($rootScope, $scope, $http, $stateParams, $state){

    $scope.iswc = $stateParams.iswc;

    $scope.artists=[];

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
    $scope.author=$scope.answer.composerAuthor[0];
     $scope.title=$scope.answer.title.charAt(0).toUpperCase()+$scope.answer.title.substring(1).toLowerCase();
    for(var i = 0, len = $scope.answer.performer.length; i < len; i++)
    {
        $scope.artists.push({

         name: $scope.answer.performer[i].charAt(0).toUpperCase()+$scope.answer.performer[i].substring(1).toLowerCase()
        });
    }

     $scope.isSong = true;
     $scope.isConcert = true;


  }, function errorCallback(response) {

// FAIRE UNE DISTINCTION ICI EN FONCTION DU TYPE DERREUR RECUE

$scope.isSong=false;
$scope.isConcert= false;

  });



  $scope.printMore = function() {
$scope.numLimit=$scope.numLimit+5;
$route.reload();
  };


  $scope.myGoBack = function() {
window.history.back()  };


}]);

