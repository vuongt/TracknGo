angular.module('starter.controllers')


.controller('SearchCtrl', ['$rootScope', '$scope', '$http', "$stateParams", "$ionicPopup", function($rootScope, $scope, $http, $stateParams, $ionicPopup){
  //$scope.isConcert = false;
  $scope.isSong = false;
  $scope.filter= "performers";
  //$scope.concerts == [];
    $scope.submitSearch = function(search, filter){
            $http({
              method: 'GET',
              url: 'http://localhost:8080/search/works?query='+search+'&filters='+filter+'&page=1',
              header:{
              Origin:'http://localhost:8100'
            }
}).then(function successCallback(response) {
    $scope.answer = response.data.results;

    if (response.data.error ==""){
      console.log($scope.answer);
      for(var i = 0, len = $scope.answer.length; i < len; i++)
      {
        var temp = $scope.answer[i].title.trim();
        $scope.answer[i].title = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
         if ($scope.answer[i].iswc.length != 0){
              $scope.answer[i].isInfo = true;
         }

      }
      if ($scope.answer.length!=0)
        $scope.isSong=true;


    }else {
      //Show an alert of the error
     $scope.answer[i].isInfo= false;
      var alertPopup = $ionicPopup.alert({
        title: "Error !",
        template: $scope.error
      });
      alertPopup.then(function(res) {
        console.log($scope.error);
      });
    }
  }, function errorCallback(response) {

  });
  }
  }]);



