angular.module('starter.controllers')
  .controller('ProfilCtrl', function($scope,AuthService,API_ENDPOINT,$http,$state) {
    $scope.userdata = AuthService.getUserInfo();



    //================Favorite Manager===============
    $scope.isLikedAuth = function(name){return(AuthService.isLikedAuth(name, $scope.userdata));    };
    $scope.isLiked = function(iswc){return(AuthService.isLiked(iswc, $scope.userdata));    };
    $scope.isLikedArt = function(name){return(AuthService.isLikedArt(name, $scope.userdata));    };
    $scope.delFavorites = function(iswc, name){
      AuthService.delFavorites(iswc, name,verifyAction);
    };
    $scope.addFavorites = function(iswc, name){
      AuthService.addFavorites(iswc, name,verifyAction);
    };
    $scope.delFavoritesAuth = function(name){
      AuthService.delFavoritesAuth(name,verifyAction);
    };
    $scope.addFavoritesAuth = function(name){
      AuthService.addFavoritesAuth(name,verifyAction);
    };
    $scope.delFavoritesArt = function(name){
      AuthService.delFavoritesArt(name,verifyAction);
    };
    $scope.addFavoritesArt = function(name){
      AuthService.addFavoritesArt(name,verifyAction);
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

//==============Authentication manager===============
  $scope.logout = function() {
    AuthService.logout();
    $state.go('tab.home');
  };
  $scope.destroySession = function() {
    AuthService.logout();
  };
//==============Navigation===================
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


