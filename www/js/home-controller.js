angular.module('starter.controllers')
  .controller('HomeCtrl', function ($scope, $state, $cordovaGeolocation, $http, $ionicModal, AuthService,API_ENDPOINT) {

    Date.prototype.yyyymmdd = function () {
      month = '' + (this.getMonth() + 1),
        day = '' + this.getDate();
      year = this.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    };

//Chargement des concerts
  $scope.cdeprog="0008201463";
  $scope.charging=true;
  $isConcertHome=false;
  var now = new Date();
    $scope.date = now.toISOString();
    //TODO set this to user's date

  $http({
  method: 'GET',
  url: API_ENDPOINT.url + '/search/concerts?position=&radius=&start=&end=',
  header:{
    Origin:'http://localhost:8100'
  }
  }).then(function successCallback(response) {


  $scope.charging=false;
  $scope.answer = response.data;


      if ($scope.answer.error == ""){
        $scope.concerts = $scope.answer.concerts;
        console.log($scope.concerts);

        if ($scope.concerts.length!=0){

        $scope.isConcertHome=true;

        }
        $scope.concerts.forEach(function (item,index) {
          item.TITRPROG = item.TITRPROG.charAt(0).toUpperCase() + item.TITRPROG.substring(1).toLowerCase();
          item.DATDBTDIF = new Date(item.DATDBTDIF);
          AuthService.isInPlanning(item.CDEPROG, item.id_bit ,function (isInPlanning) {
            item.isInPlanning = isInPlanning;
          })
        });

      }
    }, function errorCallback(response) {
    });


    $scope.concerts = [$scope.answer];
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
      function isInfoWindowOpen(infoWindow) {
        var map = infoWindow.getMap();
        return (map !== null && typeof map !== "undefined");
      }

      google.maps.event.addListenerOnce($scope.map, 'idle', function () {
        for (var i = 0; i < $scope.concerts.length; i++) {
          (function () {
            var concert = $scope.answer;
            var address = "avenue Sully prudhomme, Châtenay";
            geocoder.geocode({'address': address}, function (results, status) {
              if (status === google.maps.GeocoderStatus.OK) {
                var marker = new google.maps.Marker({
                  map: $scope.map,
                  animation: google.maps.Animation.DROP,
                  position: results[0].geometry.location
                });
                var infoWindow = new google.maps.InfoWindow({
                  //content: concert.title
                });
                google.maps.event.addListener(marker, 'click', function () {
                  if (isInfoWindowOpen(infoWindow)) {
                    infoWindow.close();
                  }
                  else {
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


    $scope.addPlanning = function (date, location, title, cdeprog, id_bit) {


      AuthService.addPlanning(date, location, title, cdeprog, id_bit, function (result) {
        if (!result.auth) {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Oups !',
            template: 'Please sign in to do this action',
            okText: 'Sign in'
          });

          confirmPopup.then(function (res) {
            if (res) {
              $state.go('tab.profil');
            } else {
              console.log('Action annulé');
            }
          });
        }
      });



    };
    $scope.removePlanning = function (cdeprog, id_bit) {
      console.log("removing concert from planning with id" + id_bit);

      AuthService.delPlanning(cdeprog, id_bit);


    };

    //for the quicksearch modal
    $ionicModal.fromTemplateUrl('templates/quicksearch.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function () {
      $scope.modal.show();
    };

    $scope.closeModal = function () {
      $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
      // Execute action
    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
      // Execute action
    });
  });
