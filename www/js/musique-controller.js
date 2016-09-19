angular.module('starter.controllers').controller('MusiqueCtrl', function($scope) {

  $scope.name="No bad days";
  $scope.myGoBack = function() {
    window.history.back()  };

});
