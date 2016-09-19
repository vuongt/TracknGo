angular.module('starter.controllers')
  .controller('HomeCtrl', function ($scope, $state, $cordovaGeolocation) {

    //initialisation google maps

    var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var geocoder = new google.maps.Geocoder();
      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      google.maps.event.addListenerOnce($scope.map, 'idle', function () {
        var address = "27 rue de Tocqueville Paris ";
        geocoder.geocode({'address': address}, function (results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            var marker = new google.maps.Marker({
              map: $scope.map,
              animation: google.maps.Animation.DROP,
              position: results[0].geometry.location
            });
            var infoWindow = new google.maps.InfoWindow({
              content: "Here I am!"
            });

            google.maps.event.addListener(marker, 'click', function () {
              infoWindow.open($scope.map, marker);
            });


          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });



      }, function (error) {
      });


    });


    //templates concerts
    $scope.concerts = [
      {
        titre: "titre 1",
        date: "date 1",
        adresse: "13 Passage du Moulinet, 75013 Paris ",
        show: false
      }
      ,
      {
        titre: "titre 2",
        date: "date 2",
        adresse: "adresse 2",
        show: false
      },
      {
        titre: "titre 3",
        date: "date 3",
        adresse: "adresse 3",
        show: false
      }
    ];

  });
