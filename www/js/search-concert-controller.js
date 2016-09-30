/**
 * Created by vuong on 30/09/2016.
 */
angular.module('starter.controllers')
  .controller('SearchConcertCtrl',function($rootScope,$scope, $ionicPopup,$state){
    $scope.search = function(locationString,geolocation,radius,start,end){
      //Get location
      if (geolocation){
        //TODO get curernt position and write it to $scope.location
        $scope.location="";
      } else {
        $scope.location="";
        //TODO connect to google maps by locationString to get coordinates then write it to $scope.location
      }
      //Radius
      if (radius){
        $scope.radius= radius;
      } else {
        $scope.radius = "";
      }
      //Get and verify date
      if (start && end && start < end){
        $scope.start = start;
        $scope.end = end;
      } else {
        //Show an alert that user has to choose a date
        var alertPopup = $ionicPopup.alert({
          title: "Oups !",
          template: "Choissiez une date de début et une date de fin valide!"
        });
        alertPopup.then(function (res) {
          console.log("Date entrée non valide");
        });
      }
      //passe parameter to home page
      $state.go('tab.home',{location:$scope.location,radius:$scope.radius,start:$scope.start,end:$scope.end});
    }
  });

