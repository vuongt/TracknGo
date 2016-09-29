angular.module('starter.controllers')


.controller('SearchCtrl', ['$rootScope', '$scope', '$http', 'AuthService', "$stateParams", "$ionicPopup", function($rootScope,$scope,$http, AuthService,$stateParams, $ionicPopup,$route){



  $scope.isSong = false;
  $scope.isPlus = false;
  $scope.numLimit = 5;
  $scope.filter= "all";
  $scope.nbrPage=1;
  $scope.charging=false;
  //$scope.concerts == [];

  $scope.userdata = AuthService.getUserInfo();

  $scope.isLiked = function(iswc){
    return(AuthService.isLiked(iswc, $scope.userdata));
  };
  $scope.delFavorites = function(iswc, name){
      AuthService.delFavorites(iswc, name,verifyAction);
  };
  $scope.addFavorites = function(iswc, name){
       AuthService.addFavorites(iswc, name,verifyAction);
  };
  function verifyAction(authorized,actionSucceed){
    if (!authorized) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Oups !',
        template: 'Please sign in to do this action',
        okText:'Sign in'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $state.go('tab.profil');
        } else {
          console.log('Action annulé');
        }
      });
    } else if (!actionSucceed){
      var alertPopup = $ionicPopup.alert({
        title: "Oups !",
        template: "There is a problem while connecting to server. Please try again later"
      });
      alertPopup.then(function (res) {
        console.log($scope.error);
      });
    } else {
      $scope.userdata = AuthService.getUserInfo();
    }
  }

    $scope.submitSearch = function(search, filter){
        $scope.charging=true;
            $http({
              method: 'GET',
              url: 'http://localhost:8080/search/works?query='+search+'&filters='+filter+'&page='+$scope.nbrPage,
              header:{
              Origin:'http://localhost:8100'
            }
}).then(function successCallback(response) {
     $scope.charging=false;
    $scope.answer = response.data.results;
    $scope.error = response.data.error;
     $scope.isSong = false;
     $scope.isPlus= false;
   $scope.numLimit=5;


    if (response.data.error ==""){
      console.log($scope.answer);
      for(var i = 0, len = $scope.answer.length; i < len; i++)
      {
        var temp = $scope.answer[i].title.trim();
        $scope.answer[i].title = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
        $scope.answer[i].isInfo = false;

        if ($scope.answer[i].iswc.length != 0){
              $scope.answer[i].isInfo = true;
         }
              if ($scope.answer.length!=0){

                $scope.isSong=true;
                if ($scope.numLimit<=len){$scope.isPlus = true;}
              }
        }

        if ($scope.answer.length<100){
        $scope.maxResults=$scope.answer.length;
        }

        $scope.answer.sort(compare);
      }



    else {
      //Show an alert of the error
      if (response.data.error ==""){
     $scope.answer[i].isInfo= false;}
      var alertPopup = $ionicPopup.alert({
        title: "Recherche impossible !",
        template: $scope.error
      });
      alertPopup.then(function(res) {
        console.log($scope.error);
      });
    }
  }, function errorCallback(response) {

  });
  }

  $scope.printMore = function () {
    $scope.numLimit = $scope.numLimit + 5;
    if ($scope.numLimit >= $scope.maxResults) {
      $scope.isPlus = false;
    }
  };
  }]);
function compare(a,b) {
  if (a.title < b.title)
    return -1;
  if (a.title > b.title)
    return 1;
  return 0;
}

