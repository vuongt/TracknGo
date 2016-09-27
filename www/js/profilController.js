angular.module('starter.controllers')
  .controller('ProfilCtrl', function($scope,AuthService,API_ENDPOINT,$http,$state) {
    /*$scope.userdata = {};
    $http.get(API_ENDPOINT.url + '/profile').then(function successCallback(response){
      $scope.userdata = response.data;
      console.log($scope.userdata);
    },function errorCallback(response){
      console.log(response);
    });*/
    $scope.userdata = AuthService.getUserInfo();


    $scope.isLikedAuth = function(name){

 return(AuthService.isLikedAuth(name, $scope.userdata));    };



    $scope.isLiked = function(iswc){

 return(AuthService.isLiked(iswc, $scope.userdata));    };



     $scope.isLikedArt = function(name){

  return(AuthService.isLikedArt(name, $scope.userdata));    };



        $scope.delFavorites = function(iswc, name){
            AuthService.delFavorites(iswc, name);
            $scope.userdata = AuthService.getUserInfo();


            };
        $scope.addFavorites = function(iswc, name){
             AuthService.addFavorites(iswc, name);
             $scope.userdata = AuthService.getUserInfo();

            };



        $scope.delFavoritesAuth = function(name){
            AuthService.delFavoritesAuth(name);
            $scope.userdata = AuthService.getUserInfo();


            };
        $scope.addFavoritesAuth = function(name){
             AuthService.addFavoritesAuth(name);
             $scope.userdata = AuthService.getUserInfo();

            };


        $scope.delFavoritesArt = function(name){
            AuthService.delFavoritesArt(name);
            $scope.userdata = AuthService.getUserInfo();


            };
        $scope.addFavoritesArt = function(name){
             AuthService.addFavoritesArt(name);
             $scope.userdata = AuthService.getUserInfo();

            };





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


