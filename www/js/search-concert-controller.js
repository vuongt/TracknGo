
angular.module('starter.controllers')
  .controller('SearchConcertCtrl',function($rootScope,$scope,$cordovaGeolocation, $ionicPopup,$state, $ionicHistory){
    var geocoder = new google.maps.Geocoder();
     $scope.charging=false;
     $scope.programmes = false;
     $scope.interpret = false;

    var getRadius = function(radius){
      if (radius){
        $scope.radius= radius; //en km
      } else {
        $scope.radius = "50";
      }
    };
    $scope.search = function(locationString,geolocation,radius,start,end,programmes,interpret){
      if (start && end && start <= end){
        $scope.start = start;
        $scope.end = end;
        if (!geolocation && !locationString) {
          //Show an alert that user has to choose a date
          var alert1 = $ionicPopup.alert({
            title: "Oups !",
            template: "Vous n'avez pas défini le lieu de recherche !"
          });
          alertPopup.then(function (res) {
            console.log("without location");
          });
        }
        if (geolocation && locationString){
          this.geolocation=false;
        }
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
            //passe parameter to home page
            console.log('programmes : ' + programmes);
            $ionicHistory.clearCache().then(function(){ $state.go('tab.home',{lng: $scope.lng, lat:$scope.lat,radius:$scope.radius,start:$scope.start,end:$scope.end, programmes:programmes, interpret:interpret}) })
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
              //passe parameter to home page
              console.log('programmes : ' + programmes);
              $ionicHistory.clearCache().then(function(){ $state.go('tab.home',{lng: $scope.lng, lat:$scope.lat,radius:$scope.radius,start:$scope.start,end:$scope.end, programmes:programmes, interpret:interpret}) })
            } else {
              alert( 'Geocode was not successful for the following reason: ' + status );
            }
          } );
        }
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
    $scope.geolocationOn= function (geolocation){
      this.geolocation = true;
    }
    $scope.geolocationOff= function (geolocation){
      this.geolocation = false;
    }
  });

