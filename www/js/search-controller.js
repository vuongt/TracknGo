angular.module('starter.controllers')


.controller('SearchCtrl', ['$rootScope', '$scope', '$http', "$stateParams", "$state", function($rootScope, $scope, $http, $stateParams){

  $scope.isConcert = true;
  $scope.isArtist = true;
  $scope.isAuthor = true;
  $scope.isSong = true;

  $scope.filter= "performers";
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
    $scope.songs = [];


    $scope.submitSearch = function(search, filter){



            $http({
              method: 'GET',
              url: 'http://localhost:8080/search/works?query='+search+'&filters='+filter+'&page=1',
              header:{
              Origin:'http://localhost:8100'
            }

}).then(function successCallback(response) {

    $scope.answer = response.data.results;
    console.log($scope.answer);
    for(var i = 0, len = $scope.answer.length; i < len; i++)
    {
        $scope.songs.push({

         iswc: $scope.answer[i].iswc,
         name: $scope.answer[i].title.charAt(0).toUpperCase()+$scope.answer[i].title.substring(1).toLowerCase()

        });
    }

     $scope.isSong = true;
     $scope.isConcert = true;






  }, function errorCallback(response) {

// FAIRE UNE DISTINCTION ICI EN FONCTION DU TYPE DERREUR RECUE


  });

  }

  }]);



