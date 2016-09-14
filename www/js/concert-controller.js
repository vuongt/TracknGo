angular.module('starter.controllers', []).controller('ConcertCtrl', function($scope) {

  $scope.name="The Dumplings en concert";

  $scope.date="29 septembre 2016";
  $scope.time="A partir de 20h";

  $scope.titres=["Item1", "Item2"];
  $scope.comments=["Commentaire1", "Commentaire2"];
  $scope.place="La Grande Hall";
  $scope.adress="211 Avenue Jean Jaurès, 75019 Paris";
});

