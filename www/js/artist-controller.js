angular.module('starter.controllers').controller('ArtistCtrl', function($scope, $http) {

  $scope.name= "stromae";

  $scope.concerts=[];
  $scope.songs=[];




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
            titre : $scope.answer.works[i].title,
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





$scope.concerts = [
      {
        titre : "titre 1",
        date : "date 1",
        adresse: "adresse 1",
        show: false
      }
      ,
      {
        titre : "titre 2",
        date : "date 2",
        adresse: "adresse 2",
        show: false
      },
      {
        titre : "titre 3",
        date : "date 3",
        adresse: "adresse 3",
        show: false
      }
    ];




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


  $scope.myGoBack = function() {
window.history.back()  };


});

