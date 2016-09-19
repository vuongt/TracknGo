angular.module('starter.controllers').controller('ArtistCtrl', function($scope, $http) {

  $scope.name= "Artist Name";

	//$http.get('http://localhost:8080/artist?name=STROMAE').then(function(res){
   // console.log(res.data);	})

  $scope.isSong = true;


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

    $scope.songs = ["titre 1", "titre 2", "titre 3"];



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

