angular.module('starter.controllers')
  .controller('HomeCtrl', function ($scope, $state, $cordovaGeolocation, $ionicModal) {

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

      google.maps.event.addListenerOnce($scope.map, 'idle', function () {
        for(var i = 0; i < $scope.concerts.length;i++){
          (function(){
            var concert = $scope.concerts[i];
            var address = concert.adresse;
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
                  infoWindow.open($scope.map, marker);
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


    //templates concerts
    $scope.concerts = [
      {
        titre: "le Mood's",
        date: "date 1",
        adresse: "13 Passage du Moulinet, 75013 Paris ",
        show: false
      }
      ,
      {
        titre: "Théatre Dunois",
        date: "date 2",
        adresse: "7 Rue Louise Weiss, 75013 Paris",
        show: false
      },
      {
        titre: "Théâtre13-Seine",
        date: "date 3",
        adresse: "30 Rue du Chevaleret, 75013 Paris",
        show: false
      }
    ];

    //for the quicksearch modal
    $ionicModal.fromTemplateUrl('templates/quicksearch.html', {
      scope: $scope,
      animation: 'slide-in-up',
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
