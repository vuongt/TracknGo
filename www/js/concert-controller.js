angular.module('starter.controllers').controller('ConcertCtrl', function ($scope, $ionicModal, $state, $http) {

  $scope.id_prog = 1092020;

  $scope.name = "The Dumplings en concert";

  $scope.date = "29 septembre 2016";
  $scope.time = "A partir de 20h";

  $scope.titres = [{"title": "Item1", "author": "The Dumpling", "album": "Album"}, {
    "title": "Item2",
    "author": "The Dumpling",
    "album": "Album"
  }];
  $scope.place = "La Grande Hall";
  $scope.adress = "211 Avenue Jean Jaurès, 75019 Paris";


  concerts = ["concert1", "concert2"];

  $scope.myGoBack = function () {
    window.history.back()
  };

  $scope.comments = [];

  $http({
    method: 'GET',
    url: 'http://localhost:8080/comment',
    header: {
      Origin: 'http://localhost:8100'
    }
  }).then(function successCallback(response) {
    $scope.answer = response.data.result;
    $scope.error = response.data.error;
    if ($scope.error == "") {
      if ($scope.answer.length !== 0) {
        for (var i = 0, len = $scope.answer.length; i < len; i++) {
          $scope.comments.push($scope.answer[i]);
        }
      }
    } else {
      //Show an alert of the error
      $scope.answer.works[i].isInfo = false;
      var alertPopup = $ionicPopup.alert({
        title: "Error !",
        template: $scope.error
      });
      alertPopup.then(function (res) {
        console.log($scope.error);
      });
    }
  }, function errorCallback(error) {
    console.log(error);
  });


});



