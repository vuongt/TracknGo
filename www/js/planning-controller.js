angular.module('starter.controllers').controller('PlanningCtrl', function ($scope, $http, AuthService,API_ENDPOINT) {

  $scope.month = new Date();

  $scope.monthNames = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
  ];

  function getPlanning() {
    $http({
      method: 'GET',
      url: API_ENDPOINT.url + '/planning',
      header: {
        Origin: 'http://localhost:8100'
      }
    }).then(function successCallback(response) {
      $scope.authorized = response.data.authorized;

      $scope.results = response.data.events;
      console.log($scope.results);
      for (var i = 0; i < $scope.results.length; i++) {
        $scope.results[i].prog_date = new Date($scope.results[i].prog_date);
        $scope.results[i].isInPlanning = true;
      }
    });
  }
  getPlanning();
  $scope.removePlanning = function (cdeprog, id_bit) {
    console.log("removing concert from planning with id" + id_bit);
    AuthService.delPlanning(cdeprog, id_bit);
    getPlanning();
  };



  $scope.myGoBack = function () {
    window.history.back()
  };

});
