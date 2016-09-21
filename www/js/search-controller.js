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
    $scope.songs = [];


    $scope.submitSearch = function(search, filter){


            $http({
              method: 'GET',
              url: '/search/works?query='+search+'&filters='+filter+'&page=1',
              header:{
              Origin:'http://localhost:8100'
            }

}).then(function successCallback(response) {

    $scope.answer = response.data;

    for(var i = 0, len = $scope.answer.works.length; i < len; i++)
    {
        $scope.songs.push({

         name: $scope.answer.works[i].title,
         iswc: $scope.answer.works[i].iswc
        });
    }

     $scope.isSong = true;
     $scope.isConcert = true;


  }, function errorCallback(response) {

// FAIRE UNE DISTINCTION ICI EN FONCTION DU TYPE DERREUR RECUE

$scope.isSong=false;
$scope.isConcert= false;

})
}
 });








