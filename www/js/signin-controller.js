angular.module('starter.controllers').controller('SigninCtrl', function($scope,$ionicPopup,$state,AuthService) {
  $scope.data={
    email:"",
    password:""
  }
  $scope.signin = function(){
    AuthService.login($scope.data).then(function(msg) {
      $state.go('tab.profil',reload = true);
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Oups...login failed!',
        template: errMsg
      });
    });
  }
});
