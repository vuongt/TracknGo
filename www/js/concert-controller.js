angular.module('starter.controllers')


.controller('ConcertCtrl', function($scope) {

  $scope.name="The Dumplings en concert";

  $scope.date="29 septembre 2016";
  $scope.time="A partir de 20h";

  $scope.titres=[{"title":"Item1", "author":"The Dumpling", "album":"Album"}, {"title":"Item2", "author":"The Dumpling", "album":"Album"}];
  $scope.comments=[{"sender":"EouiseLeGall", "date":"Hier, à 20h", "content":"Lorem ipsum dolor "}, {"sender":"LouiseLeGall", "date":"Hier, à 20h", "content":"Lorem ipsum dolor "}];
  $scope.place="La Grande Hall";
  $scope.adress="211 Avenue Jean Jaurès, 75019 Paris";




});

