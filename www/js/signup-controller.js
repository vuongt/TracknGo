angular.module('starter.controllers').controller('SignupCtrl', function($scope,$ionicPopup,$state,AuthService) {
  $scope.data={
    name: "",
    email:"",
    password:""
  }
  $scope.signup = function(){
    AuthService.register($scope.data).then(function(msg) {
      $state.go('tab.profil');
      var alertPopup = $ionicPopup.alert({
        title: 'Register success!',
        template: msg
      });
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Oups...register failed!',
        template: errMsg
      });
    });
  }
});
