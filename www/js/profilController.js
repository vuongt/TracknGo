angular.module('starter.controllers')
  .run(function(AuthService,$state){
    console.log('change to sign in because not authenticated')
    if( !AuthService.isAuthenticated()){
      $state.go('tab.signin')
    }
  })
  .controller('ProfilCtrl', function($scope,AuthService,API_ENDPOINT,$http,$state) {
    /*$scope.userdata = {};
    $http.get(API_ENDPOINT.url + '/profile').then(function successCallback(response){
      $scope.userdata = response.data;
      console.log($scope.userdata);
    },function errorCallback(response){
      console.log(response);
    });*/
    $scope.userdata = AuthService.getUserInfo();

    $scope.logout = function() {
      AuthService.logout();
      $state.go('tab.home');
    };


    $scope.destroySession = function() {
      AuthService.logout();
    };

  $scope.myGoBack = function() {
  window.history.back()  };


  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
  });
