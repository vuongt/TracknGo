angular.module('starter.controllers')
  .controller('SearchCtrl', function($scope, $http) {

  $scope.isConcert = true;
  $scope.isArtist = true;
  $scope.isAuthor = true;
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

    $scope.authors = ["auteur 1", "auteur 2", "auteur 3"];
    $scope.artists = ["artist 1", "artist 2", "artist 3"];
    $scope.songs = ["titre 1", "titre 2", "titre 3"];


    $scope.submitSearch = function  () {


            $http({
              method: 'GET',
              url: 'http://localhost:8080/search/works?query='+search+"&filters="+filter,
              header:{
              Origin:'http://localhost:8100'
            }
            })

      }



  });





