angular.module('starter.controllers').controller('SignupCtrl', function($scope,$http) {
  $scope.data={
    name: "",
    email:"",
    password:""
  }


  $scope.signup = function(data){
    console.log(data);
    $http({
      method: 'POST',
      url:'http://localhost:8080/signup',
      /*header:{
        Origin:'http://localhost:8100'
      },*/
      data:data
    }).then(function successCallback(response) {
      $scope.answer = response.data;
      console.log($scope.answer);

    }, function errorCallback(response) {

// FAIRE UNE DISTINCTION ICI EN FONCTION DU TYPE DERREUR RECUE

      $scope.isSong=false;
      $scope.isConcert= false;

    });
  }

});
