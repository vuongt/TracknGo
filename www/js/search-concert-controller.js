/**
 * Created by vuong on 30/09/2016.
 */
angular.module('starter.controllers')
  .controller('SearchConcertCtrl',function($rootScope,$scope,$cordovaGeolocation, $ionicPopup,$state){

  geocoder = new google.maps.Geocoder();

    $scope.search = function(locationString,geolocation,radius,start,end){
      //Get location
      if (geolocation){

              var options = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
        $scope.location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        $scope.lng= $scope.position.coords.latitude;
        $scope.lat= $scope.position.coords.longitude;

         console.log(position.coords.latitude, position.coords.longitude);
         console.log("Searching for your location");


                     var mapOptions = {
                         center: myLatlng,
                         zoom: 16,
                         mapTypeId: google.maps.MapTypeId.ROADMAP
                     };

                     var map = new google.maps.Map(document.getElementById("map"), mapOptions);

                     $scope.map = map;
                     $ionicLoading.hide();


          }, function(err) {
                     $ionicLoading.hide();
                     console.log(err);
                 });


      } else {
        $scope.location="";


        geocoder.geocode( { 'address' : locationString}, function( results, status ) {
                if( status == google.maps.GeocoderStatus.OK ) {
                    $scope.location= (results[0].geometry.location.lat(), results[0].geometry.location.lng())
                    $scope.lng=results[0].geometry.location.lng();
                    $scope.lat=results[0].geometry.location.lat();
                    console.log(results[0].geometry.location.lat(), results[0].geometry.location.lng());

                } else {
                    alert( 'Geocode was not successful for the following reason: ' + status );
                }
            } );







      }
      //Radius
      if (radius){
        $scope.radius= radius;
      } else {
        $scope.radius = "";
      }
      //Get and verify date
      if (start && end && start <= end){
        $scope.start = start;
        $scope.end = end;
        //passe parameter to home page
        $state.go('tab.home',{lng: $scope.lng, lat:$scope.lat,radius:$scope.radius,start:$scope.start,end:$scope.end});
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
    }
  });

