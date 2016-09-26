angular.module('starter.controllers').controller('PlanningCtrl', function ($scope, $http) {

  $scope.month = new Date();
  $http({
    method: 'GET',
    url: 'http://localhost:8080/planning',
    header: {
      Origin: 'http://localhost:8100'
    }
  }).then(function successCallback(response) {
    $scope.authorized = response.data.authorized;

    $scope.results = response.data.events;
    for(var i = 0; i<$scope.results.length ; i++){
      $scope.results[i].prog_date = new Date($scope.results[i].prog_date);
    }

    console.log($scope.authorized);
    console.log($scope.results[0].prog_date);
  });

  console.log($scope.month);




  $scope.myGoBack = function () {
    window.history.back()
  };

});
