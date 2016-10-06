angular.module('starter.controllers').controller('TabCtrl', function ($scope,$ionicHistory,$state) {

  $scope.goSearch = function () {
    $state.go("tab.search");
  };

  $scope.goHome = function () {
    $ionicHistory.clearCache().then(function(){ $state.go("tab.home", {lat : 0, lng: 0})});
  };

  $scope.goConcert = function () {
    $state.go("tab.searchConcert");
  };

  $scope.goProfil = function () {
    //$ionicHistory.clearHistory();
    $state.go("tab.profil",{},{reload:true});
  };

});
