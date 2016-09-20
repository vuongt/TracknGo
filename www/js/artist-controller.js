angular.module('starter.controllers').controller('ArtistCtrl', ['$rootScope', '$scope', '$http', "$stateParams", "$state", function($rootScope, $scope, $http, $stateParams, $state){


  $scope.name = $stateParams.name;


  $scope.concerts=[];
  $scope.songs=[];

  $scope.numLimit=5;


$http({
  method: 'GET',
  url: 'http://localhost:8080/artist?name='+$scope.name,
  header:{
    Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {

    $scope.answer = response.data;
    for(var i = 0, len = $scope.answer.concerts.length; i < len; i++)
    {

        $scope.concerts.push({

          titre : $scope.answer.concerts[i].title,
          date : $scope.answer.concerts[i].datetime,
          venue: $scope.answer.concerts[i].venue,
          location: $scope.answer.concerts[i].location,
          show: false

        });

    }


    for(var i = 0, len = $scope.answer.works.length; i < len; i++)
      {

          $scope.songs.push({
            titre : $scope.answer.works[i].title.charAt(0).toUpperCase()+$scope.answer.works[i].title.substring(1).toLowerCase(),
            iswc : $scope.answer.works[i].iswc,


          });

      }


     $scope.isSong = true;
     $scope.isConcert = true;


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

