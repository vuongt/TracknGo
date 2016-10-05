angular.module('starter.controllers').controller('TabCtrl', function ($scope,$ionicHistory,$state) {
  console.log("test tab controller");

  $scope.goSearch = function () {
    $ionicHistory.clearHistory();
    $state.go("tab.search");
  };

  $scope.goHome = function () {
    $ionicHistory.clearHistory();
    $state.go("tab.home", {lat : 0, lng: 0});
  };

  $scope.goConcert = function () {
    $ionicHistory.clearHistory();
    $state.go("tab.searchConcert");
  };

  $scope.goProfil = function () {
    //$ionicHistory.clearHistory();
    $state.go("tab.profil",{},{reload:true});
  };

});
