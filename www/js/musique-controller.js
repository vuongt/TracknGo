angular.module('starter.controllers').controller('MusiqueCtrl', function($scope, $http, $stateParams,$state, $ionicPopup, $ionicHistory,AuthService){
  $scope.iswc = $stateParams.iswc;
  $scope.title = $stateParams.title;
  $scope.myGoBack = function() {window.history.back()  };


$scope.userdata = AuthService.getUserInfo();

        $scope.delFavoritesAuth = function(name){
            AuthService.delFavoritesAuth(name);
            $scope.userdata = AuthService.getUserInfo();
            console.log("deleting author");


            };
        $scope.addFavoritesAuth = function(name){
             AuthService.addFavoritesAuth(name);
             $scope.userdata = AuthService.getUserInfo();
             console.log("adding author");

            };



    $scope.isLikedAuth = function(name){

 return(AuthService.isLikedAuth(name, $scope.userdata));    };

$scope.charging=false;

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

      $scope.isCharged=false;

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
  });

/*  $scope.printMore = function() {
$scope.numLimit=$scope.numLimit+5;
$route.reload();
  };*/


  $scope.myGoBack = function() {
$ionicHistory.goBack();
  };


  $scope.chargeConcerts = function(iswc){
  console.log('system retrieving concerts where'+iswc+'is announced');
  $scope.charging=true;
        $http({
          method: 'GET',
          url: 'http://localhost:8080/work/program?iswc='+iswc,
          header:{
            Origin:'http://localhost:8100'
          }
        }).then(function successCallback(response) {
            $scope.concerts = response.data.concerts;
            console.log(response.data);
            if ($scope.answer.error == ""){
             $scope.isCharged=true;
              if ($scope.concerts.length!=0){
                   $scope.isConcert=true;
                   for(var i = 0, len = $scope.concerts.length; i < len; i++) {
                            $scope.concerts[i].title = $scope.answer.concerts[i].title.charAt(0).toUpperCase()+ $scope.concerts[i].title.substring(1).toLowerCase();
                          }
               }
               else{
               $scope.isConcert=false;

               }

            } else {
            $scope.isCharged=false;
            }
          }, function errorCallback(response) {
           $scope.isCharged=false;
          });


  }
});

