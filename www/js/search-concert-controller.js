/**
 * Created by vuong on 30/09/2016.
 */
angular.module('starter.controllers')
  .controller('SearchConcertCtrl',function($rootScope,$scope,$cordovaGeolocation, $ionicPopup,$state){
    var geocoder = new google.maps.Geocoder();
     $scope.charging=false;

    var getDate = function(start,end){
      if (start && end && start <= end){
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
    };
    var getLocation = function(locationString,geolocation){
      if (geolocation){
        var options = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
          //$scope.location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          $scope.lng= position.coords.latitude;
          $scope.lat= position.coords.longitude;
          console.log("Searching for your location");
          console.log(position.coords.latitude, position.coords.longitude);
        }, function(err) {
          $ionicLoading.hide();
          console.log(err);
        });
      } else {
        geocoder.geocode( { 'address' : locationString}, function( results, status ) {
          if( status == google.maps.GeocoderStatus.OK ) {
          $scope.charging=true;
            $scope.location= (results[0].geometry.location.lat(), results[0].geometry.location.lng())
            $scope.lng=results[0].geometry.location.lng();
            $scope.lat=results[0].geometry.location.lat();
            console.log(results[0].geometry.location.lat(), results[0].geometry.location.lng());
          } else {
            alert( 'Geocode was not successful for the following reason: ' + status );
          }
        } );
      }
    };
    var getRadius = function(radius){
      if (radius){
        $scope.radius= radius; //en km
      } else {
        $scope.radius = "";
      }
    };
    $scope.search = function(locationString,geolocation,radius,start,end){
      if (geolocation){
      $scope.charging=true;
        var options = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
          //$scope.location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          $scope.lat= position.coords.latitude;
          $scope.lng= position.coords.longitude;
          console.log("Searching for your location");
          console.log(position.coords.latitude, position.coords.longitude);
          getRadius(radius);
          //Get and verify date
          getDate(start,end);
          //passe parameter to home page
          $state.go('tab.home',{lng: $scope.lng, lat:$scope.lat,radius:$scope.radius,start:$scope.start,end:$scope.end});
        }, function(err) {
          $ionicLoading.hide();
          console.log(err);
        });
      } else {
        $scope.location="";
        geocoder.geocode( { 'address' : locationString}, function( results, status ) {
          if( status == google.maps.GeocoderStatus.OK ) {
            //$scope.location= (results[0].geometry.location.lat(), results[0].geometry.location.lng());
            $scope.lng=results[0].geometry.location.lng();
            $scope.lat=results[0].geometry.location.lat();
            console.log(results[0].geometry.location.lat(), results[0].geometry.location.lng());
            getRadius(radius);
            //Get and verify date
            getDate(start,end);
            //passe parameter to home page
            $state.go('tab.home',{lng: $scope.lng, lat:$scope.lat,radius:$scope.radius,start:$scope.start,end:$scope.end});
          } else {
            alert( 'Geocode was not successful for the following reason: ' + status );
          }
        } );
      }
    };
  });

