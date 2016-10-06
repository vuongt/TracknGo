angular.module('starter.controllers').controller('PlanningCtrl', function (AuthService, $scope) {

  $scope.month = new Date();

  $scope.monthNames = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
  ];

  function update(){
    $scope.results = AuthService.getPlanning();
    for (var i = 0; i < $scope.results.length; i++) {
      $scope.results[i].prog_date = new Date($scope.results[i].prog_date);
    }
  }
   update();

  $scope.removePlanning = function (cdeprog, id_bit) {
    AuthService.delPlanning(cdeprog, id_bit,verifyAction);
    console.log("concert removed");
  };
  $scope.isInPlanning = function(cdeprog, id_bit){
    return AuthService.isInPlanning(cdeprog, id_bit);
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
      update();
    }
  }

  $scope.myGoBack = function () {
    window.history.back();
  };

});
