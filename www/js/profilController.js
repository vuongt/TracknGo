angular.module('starter.controllers')
  .controller('ProfilCtrl', ['AuthService', function($scope,$http,$state,AuthService,FavoriteService,API_ENDPOINT) {
    $scope.destroySession = function() {
      AuthService.logout();
    };

    $scope.getInfo = function() {
      $http.get(API_ENDPOINT.url + '/profile').then(function(response) {
        $scope.userdata = response.data;
      });
    };

    $scope.logout = function() {
      AuthService.logout();
      $state.go('tab.home');
    };

 $scope.name = "Louise Legall";
  var authors=[];
  var songs=[];

  $scope.authors = [{name:"Indochine"}, {name:"Black m"}, {name:"Coldplay"}];

  // Les morceaux favoris
  $scope.songs = [{name: "Comme Toi", iswc:"T-003.040.646.2", isInfo: true}, {name:"All she wants", iswc:"T-003.040.646.2", isInfo: true}, {name: "Crazy train", iswc:"T-072.743.594.0", isInfo: true}];

  $scope.nbrTitres= $scope.songs.length;
  $scope.nbrAuteurs= $scope.authors.length;




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
  }]);
