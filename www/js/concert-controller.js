angular.module('starter.controllers').controller('ConcertCtrl', function (AuthService,$scope, $ionicModal, $state, $http,$stateParams) {

$scope.cdeprog= $stateParams.cdeprog;
console.log($scope.cdeprog);


$scope.userdata = AuthService.getUserInfo();



    $scope.isLiked = function(iswc){

 return(AuthService.isLiked(iswc, $scope.userdata));    };







        $scope.delFavorites = function(iswc, name){
            AuthService.delFavorites(iswc, name);
            $scope.userdata = AuthService.getUserInfo();


            };
        $scope.addFavorites = function(iswc, name){
             AuthService.addFavorites(iswc, name);
             $scope.userdata = AuthService.getUserInfo();

            };



$http({
  method: 'GET',
  url: 'http://localhost:8080/program?cdeprog='+$scope.cdeprog,
  header:{
    Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {
    $scope.answer = response.data;
    console.log(response.data);
    if ($scope.answer.error == ""){
      $scope.title=$scope.answer.title.charAt(0).toUpperCase()+ $scope.answer.title.substring(1).toLowerCase();
      $scope.location=$scope.answer.location.charAt(0).toUpperCase()+ $scope.answer.location.substring(1).toLowerCase();
      $scope.setList=$scope.answer.setList;
      $scope.isSong=false;
      for(var i = 0, len = $scope.setList.length; i < len; i++) {
                $scope.isSong=true;
                var temp = $scope.setList[i].title.trim();
                $scope.setList[i].title = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
                   if ($scope.setList[i].iswc.length != 0){
                              $scope.setList[i].isInfo = true;
                         }


              }


    } else {

    }
  }, function errorCallback(response) {
  });








//Revenir en arrière

  $scope.myGoBack = function () {
    window.history.back()
  };

  $scope.comments = [];
// Gestion des commentaires

  $http({
    method: 'GET',
    url: 'http://localhost:8080/comment',
    header: {
      Origin: 'http://localhost:8100'
    }
  }).then(function successCallback(response) {
    $scope.answer = response.data.result;
    $scope.error = response.data.error;
    if ($scope.error == "") {
      if ($scope.answer.length !== 0) {
        for (var i = 0, len = $scope.answer.length; i < len; i++) {
          $scope.comments.push($scope.answer[i]);
        }
      }
    } else {

    }
  }, function errorCallback(error) {
    console.log(error);
  });


});



