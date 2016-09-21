angular.module('starter.controllers').controller('ArtistCtrl', ['$rootScope', '$scope', '$http', "$stateParams", "$state", function($rootScope, $scope, $http, $stateParams, $ionicPopup){
  $scope.name = $stateParams.name;
  //$scope.concerts=[];
  //$scope.songs=[];
  $scope.numLimit=5;

$http({
  method: 'GET',
  url: 'http://localhost:8080/artist?name='+$scope.name,
  header:{
    Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {

    $scope.answer = response.data;
    $scope.error = $scope.answer.error;
    $scope.isSong = false;
    $scope.isConcert = false;
    if ($scope.error==""){
      if ($scope.answer.works.length !== 0){
        $scope.isSong = true;
        for(var i = 0, len = $scope.answer.works.length; i < len; i++) {
          var temp = $scope.answer.works[i].title;
          $scope.answer.works[i].title = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
        }
      }
      if ($scope.answer.concerts.length !==0){
        $scope.isConcert = true;
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

$scope.isSong=false;
$scope.isConcert= false;

  });








  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };

  $scope.printMore = function() {
$scope.numLimit=$scope.numLimit+5;
$route.reload();


  };


  $scope.myGoBack = function() {
window.history.back()  };


}]);

