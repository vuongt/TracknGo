angular.module('starter.controllers')


.controller('SearchCtrl', ['$rootScope', '$scope', '$http', "$stateParams", "$state", function($rootScope, $scope, $http, $stateParams){

  $scope.isConcert = false;
  $scope.isArtist = false;
  $scope.isAuthor = false;
  $scope.isSong = false;

  $scope.filter= "performers";


    $scope.songs = [];
    $scope.authors == [];
    $scope.artists == [];
   $scope.concerts == [];


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


    if ($scope.songs.length!=0)
        $scope.isSong=true;




  }, function errorCallback(response) {

// FAIRE UNE DISTINCTION ICI EN FONCTION DU TYPE DERREUR RECUE


  });

  }

  }]);



