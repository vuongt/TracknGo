angular.module('starter.controllers')
  .controller('HomeCtrl', function ($scope, $state, $cordovaGeolocation, $http, $ionicModal, AuthService, API_ENDPOINT, HEADER_ORIGIN, $stateParams, $ionicPopup) {


// ================================== INITIALIZATIONS ====================================
    $scope.numLimit = 3;
    $scope.isPlus = false;

    Date.prototype.yyyymmdd = function () {
      month = '' + (this.getMonth() + 1),
        day = '' + this.getDate();
      year = this.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    };

    $scope.charging = true;
    $scope.chargingMap = true;
    $scope.isConcertHome = false;
    $scope.lat = "";
    var count = 0;
    $scope.lng = "";
    $scope.radius = "30000";
    $scope.is1prog = false;
    $scope.start = "";
    $scope.end = "";
    $scope.timeCriteria = "aujourd'hui";
    $scope.programmes = false;
    $scope.interpret = false;
    $scope.nombreConcerts = 0;
    $scope.finished = false;

// Vérification des données de lat et de long recupérées dans l'url
    if ($stateParams.lat && $stateParams.lat !== "") {
      $scope.lat = parseFloat($stateParams.lat);
    }
    if ($stateParams.lng && $stateParams.lng !== "") {
      $scope.lng = parseFloat($stateParams.lng);
    }


    if ($stateParams.radius && $stateParams.radius !== "") {
      $scope.radius = $stateParams.radius;
    }

    if ($stateParams.programmes && $stateParams.programmes !== "") {
      $scope.programmes = JSON.parse($stateParams.programmes);
    }

    if ($stateParams.interpret && $stateParams.interpret !== "") {
      $scope.interpret = JSON.parse($stateParams.interpret);
    }


    if ($stateParams.start && $stateParams.start !== "" && $stateParams.end && $stateParams.end !== "") {
      $scope.start = new Date($stateParams.start);
      $scope.end = new Date($stateParams.end);
      $scope.timeCriteria = "du " + $scope.start.toLocaleDateString() + " au " + $scope.end.toLocaleDateString() + " dans un rayon de " + $scope.radius + " km";
    }

    //Fonction pour savoir si un concert doit être affiché par la recherche par interprète. itemProperty === item.hasArtist
    $scope.hasToBeShown = function (item) {
      if (($scope.programmes === true) && ($scope.interpret === true)) {
        if ((item.haveProgram === true) && (item.hasArtist === true)) {
          $scope.nombreConcerts += 1;
          item.hasToBeShown = true;
        } else {
          item.hasToBeShown = false;
        }
      } else {
        if ($scope.interpret === true) {
          if (item.hasArtist === true) {
            $scope.nombreConcerts += 1;
            item.hasToBeShown = true;
          } else {
            item.hasToBeShown = false;
          }

        } else {
          if ($scope.programmes === true) {
            if (item.haveProgram === true) {
              $scope.nombreConcerts += 1;
              item.hasToBeShown = true;
            } else {
              item.hasToBeShown = false;
            }
          } else {
            $scope.nombreConcerts += 1;
            item.hasToBeShown = true;
          }
        }
      }
    };


    var attentionAuTemps = setTimeout(function () {

      $scope.charging = false;
      $scope.isConcertHome = false;
      $scope.isPlus = false;

    }, 15000);


    var options = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

      if (!$scope.lat) {
        $scope.lat = position.coords.latitude;
        $scope.lng = position.coords.longitude;
      }

//========================================== GET INFOS ================================================
      $http({
        method: 'GET',
        url: API_ENDPOINT.url + '/search/concerts?lng=' + $scope.lng + '&lat=' + $scope.lat + '&radius=' + $scope.radius + '&start=' + $scope.start + '&end=' + $scope.end,
        header: {
          Origin: 'HEADER_ORIGIN.url'
        }
      }).then(function successCallback(response) {

        clearTimeout(attentionAuTemps);
        $scope.charging = false;
        $scope.isPlus = false;
        $scope.answer = response.data;


        if ($scope.answer.error == "") {
          if ($scope.lat == "") {
            $scope.concerts = $scope.answer.concerts;
          } else $scope.concerts = $scope.answer.restrictedConcerts;

          if ($scope.concerts.length != 0) {
            $scope.isConcertHome = true;

            if ($scope.numLimit <= $scope.concerts.length) {
              $scope.isPlus = true;
            }

          } else {
            $scope.charging = false;
          }

          $scope.concerts.forEach(function (item, index) {

            if (item.haveProgram == "NO") {
              item.haveProgram = false;
              count = count + 1;
            }
            ;
            if (item.haveProgram == "YES") {
              item.haveProgram = true

            }
            ;

            item.hasArtist = true;
            item.TITRPROG = item.TITRPROG.charAt(0).toUpperCase() + item.TITRPROG.substring(1).toLowerCase();
            item.NOM = item.NOM.charAt(0).toUpperCase() + item.NOM.substring(1).toLowerCase();
            item.VILLE = item.VILLE.charAt(0).toUpperCase() + item.VILLE.substring(1).toLowerCase();
            item.distance = parseInt(item.distance);
            item.location = item.NOM + " " + item.ADR + " " + item.VILLE;

            if (item.TITRPROG == "Manifestation de _artiste a preciser ...") {
              item.hasArtist = false;
              if (item.NOM == "Salle non referencee" || item.NOM == "" || item.NOM == " . . .") {
                item.TITRPROG = "Manifestation @ " + item.VILLE;

                item.NOM = "";
              }
              else {
                item.TITRPROG = "Manifestation @ " + item.NOM;

                item.NOM = "";
              }
            }

            if (item.TITRPROG == "") {
              item.hasArtist = false;
              item.TITRPROG = "Manifestation @ " + item.NOM;
            }

            if (item.ADR == " . . .") {
              item.ADR = "";

            }
            else {
              length = item.ADR.length;
              item.ADR = item.ADR.slice(0, length - 2);
            }

            item.DATDBTDIF = new Date(item.DATDBTDIF);
            $scope.hasToBeShown(item);
            //item.id_bit is undefined 'cause these concerts come from Eliza
          });
          if (count == $scope.concerts.length) {
            $scope.is1prog = true;
          }


// ========================================= GOOGLE MAPS MANAGER ===================================
          var init = function () {

            var mapOptions = {
              zoom: 11,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            var div = document.getElementById('map');

            $scope.map = new google.maps.Map(div, mapOptions);


            $scope.map.setCenter({lat: $scope.lat, lng: $scope.lng});

            //creation de la fonction isOpen a infowindow
            function isInfoWindowOpen(infoWindow) {
              var map = infoWindow.getMap();
              return (map !== null && typeof map !== "undefined");
            }

            google.maps.event.addListenerOnce($scope.map, 'idle', function () {


              google.maps.event.trigger($scope.map, 'resize');

              $scope.chargingMap = false;

              $scope.concerts.forEach(function (item, index) {
                  if (item.hasToBeShown === true) {
                    var marker = new google.maps.Marker({
                      map: $scope.map,
                      animation: google.maps.Animation.DROP,
                      position: {lat: parseFloat(item.LAT), lng: parseFloat(item.LNG)}
                    });
                    var infoWindow = new google.maps.InfoWindow({
                      content: item.TITRPROG + " @ " + item.VILLE.toLowerCase()
                    });
                    google.maps.event.addListener(marker, 'click', function () {
                      if (isInfoWindowOpen(infoWindow)) {
                        infoWindow.close();
                      }
                      else {
                        infoWindow.open($scope.map, marker);
                      }
                    });
                  }
                }
              );

            }, function (error) {
            });


            google.maps.event.trigger($scope.map, 'resize');

          };

          init();

        }

      }, function errorCallback(response) {
      });
    });


//===============PLANNING MANAGER===================
    var foo = AuthService.getPlanning(); //update planning for one fisrt time
    $scope.addPlanning = function (date, location, title, cdeprog, id_bit) {
      AuthService.addPlanning(date, location, title, cdeprog, id_bit, verifyAction);
    };
    $scope.removePlanning = function (cdeprog, id_bit) {
      console.log("removing concert from planning with id" + id_bit);
      AuthService.delPlanning(cdeprog, id_bit, verifyAction);
    };
    $scope.isInPlanning = function (cdeprog, id_bit) {
      return AuthService.isInPlanning(cdeprog, id_bit);
    };
    function verifyAction(authorized, actionSucceed) {
      if (!authorized) {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Oups !',
          template: 'Please sign in to do this action',
          okText: 'Sign in'
        });

        confirmPopup.then(function (res) {
          if (res) {
            $state.go('tab.profil');
          } else {
            console.log('Action annulée');
          }
        });
      } else if (!actionSucceed) {
        var alertPopup = $ionicPopup.alert({
          title: "Oups !",
          template: "There is a problem while connecting to server. Please try again later"
        });
        alertPopup.then(function (res) {
          console.log($scope.error);
        });
      } else {
        $scope.planning = AuthService.getPlanning(); // We don't use $scope.planning, but this action refresh the userPlanning in AuthService
      }
    }


    $scope.printMore = function () {
      $scope.numLimit = $scope.numLimit + 5;
      if ($scope.numLimit > $scope.concerts.length) {
        $scope.isPlus = false;
      }
    };


  });
