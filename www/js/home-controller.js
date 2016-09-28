angular.module('starter.controllers')
  .controller('HomeCtrl', function ($scope, $state, $cordovaGeolocation, $http, $ionicModal, AuthService) {

//Chargement des concerts
$scope.cdeprog="0008201463";

$http({
  method: 'GET',
  url: 'http://localhost:8080/program?cdeprog='+$scope.cdeprog,
  header:{
    Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {
$scope.answer=response.data;
    if ($scope.answer.error == ""){

        $scope.answer = response.data;



    }
  }, function errorCallback(response) {
  });



$scope.concerts=[$scope.answer];



    //initialisation google maps

    var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      var mapOptions = {
        center: latLng,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var geocoder = new google.maps.Geocoder();
      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      //creation de la fonction isOpen a infowindow
      function isInfoWindowOpen(infoWindow){
        var map = infoWindow.getMap();
        return (map !== null && typeof map !== "undefined");
      }

      google.maps.event.addListenerOnce($scope.map, 'idle', function () {
        for(var i = 0; i < $scope.concerts.length;i++){
          (function(){
            var concert = $scope.answer;
            var address = $scope.answer.location;
            geocoder.geocode({'address': address}, function (results, status) {
              if (status === google.maps.GeocoderStatus.OK) {


                var marker = new google.maps.Marker({
                  map: $scope.map,
                  animation: google.maps.Animation.DROP,
                  position: results[0].geometry.location
                });

                var infoWindow = new google.maps.InfoWindow({
                  content: concert.titre
                });

                google.maps.event.addListener(marker, 'click', function () {
                  if(isInfoWindowOpen(infoWindow)){
                    infoWindow.close();
                  }
                  else{
                    infoWindow.open($scope.map, marker);

                  }

                });


              } else {
                alert('Geocode was not successful for the following reason: ' + status);
              }
            });

          })();


        }



      }, function (error) {
      });


    });






    $scope.addPlanning = function (date, location, title, cdeprog) {
      AuthService.addPlanning(date,location,title,cdeprog);
      console.log("adding concert with location:" + location);


    };

    //for the quicksearch modal
    $ionicModal.fromTemplateUrl('templates/quicksearch.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
  });
