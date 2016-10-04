angular.module('starter.controllers')
  .controller('HomeCtrl', function ($scope, $state, $cordovaGeolocation,$http, $ionicModal, AuthService, API_ENDPOINT,$stateParams,$ionicPopup) {



    //Initialisation des variables d'affichage
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

//Chargement des concerts
    $scope.charging = true;
    $scope.isConcertHome = false;
    $scope.lat="";
    $scope.lng="";
    $scope.radius="";
    $scope.start="";
    $scope.end="";
    $scope.timeCriteria="aujourd'hui";
    if($stateParams.lat && $stateParams.lat!=="") {$scope.lat=$stateParams.lat; console.log($scope.lat)}
    if($stateParams.lng && $stateParams.lng!=="") {$scope.lng=$stateParams.lng;}


    if($stateParams.radius && $stateParams.radius!=="") {$scope.radius=$stateParams.radius;}
    if($stateParams.start && $stateParams.start!=="" && $stateParams.end && $stateParams.end!=="") {
      $scope.start=$stateParams.start;
      $scope.end=$stateParams.end;
      $scope.timeCriteria = "du " + $stateParams.start.slice(0,15) + " au " + $stateParams.end.slice(0,15) + " dans un rayon de 50km";
    }

  $http({
  method: 'GET',
  url: API_ENDPOINT.url + '/search/concerts?lng='+$scope.lng+'&lat='+$scope.lat+'&radius='+$scope.radius+'&start='+$scope.start+'&end='+$scope.end,
  header:{
    Origin:'http://localhost:8100'
  }
  }).then(function successCallback(response) {


      $scope.charging = false;
      $scope.isPlus= false;
      $scope.answer = response.data;


      if ($scope.answer.error == "") {
        if ($scope.lat ==""){
          $scope.concerts = $scope.answer.concerts;
        } else $scope.concerts = $scope.answer.restrictedConcerts;
        console.log($scope.concerts);
        if ($scope.concerts.length != 0) {

          $scope.isConcertHome = true;
          if ($scope.numLimit <= $scope.concerts.length) {
                          $scope.isPlus = true;
                        }

        }
        $scope.concerts.forEach(function (item, index) {

       item.TITRPROG = item.TITRPROG.charAt(0).toUpperCase() + item.TITRPROG.substring(1).toLowerCase();
       item.NOM = item.NOM.charAt(0).toUpperCase() + item.NOM.substring(1).toLowerCase();
       item.VILLE = item.VILLE.charAt(0).toUpperCase() + item.VILLE.substring(1).toLowerCase();

          if (item.TITRPROG == "Manifestation de _artiste a preciser ..."){
              if(item.NOM=="Salle non referencee" || item.NOM==""||item.NOM==" . . ."){
                 item.TITRPROG = "Manifestation @ "+item.VILLE;

                 item.NOM="";
              }
              else{
                  item.TITRPROG = "Manifestation @ "+item.NOM;

                  item.NOM="";
              }
              }
          if(item.ADR==" . . ."){
                   item.ADR="";

          }
          else{
              length = item.ADR.length;
              item.ADR=item.ADR.slice(0,length-2);
              }

          item.DATDBTDIF = new Date(item.DATDBTDIF);
          //item.id_bit is undefined 'cause these concerts come from Eliza
        });


        //initialisation google maps
        var options = {timeout: 10000, enableHighAccuracy: true};

        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
          var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          console.log(latLng.lat());
          if($scope.lat){
            var mapOptions = {
              center: {lat: $scope.lat, lng: $scope.lng},
              zoom: 11,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
          } else {
            var mapOptions = {
              center: latLng,
              zoom: 11,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
          }


          var geocoder = new google.maps.Geocoder();
          $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
          //creation de la fonction isOpen a infowindow
          function isInfoWindowOpen(infoWindow) {
            var map = infoWindow.getMap();
            return (map !== null && typeof map !== "undefined");
          }
          google.maps.event.addListenerOnce($scope.map, 'idle', function () {

            $scope.concerts.forEach(function (item, index) {
              setTimeout(function () {


                var request = {

                  query: item.NOM + " " + item.VILLE
                };

                var service = new google.maps.places.PlacesService($scope.map);

                service.textSearch(request, callback);

                function callback(results, status) {
                  if (status == google.maps.places.PlacesServiceStatus.OK) {
                    var marker = new google.maps.Marker({
                      map: $scope.map,
                      animation: google.maps.Animation.DROP,
                      position: results[0].geometry.location
                    });

                    var infoWindow = new google.maps.InfoWindow({
                      content: item.TITRPROG + " @ " + item.NOM.toLowerCase()
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
                  else {
                    request = {
                      query: item.VILLE

                    };
                    service.textSearch(request, function (results, status) {

                      if (status === google.maps.places.PlacesServiceStatus.OK) {

                        var marker = new google.maps.Marker({
                          map: $scope.map,
                          animation: google.maps.Animation.DROP,
                          position: results[0].geometry.location
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
                      } else {
                        console.log('Geocode was not successful for the following reason: ' + status);
                      }
                    });
                  }

                }

              }, 300*index);
            });
            /*for (var i = 0; i < $scope.concerts.length; i++) {
             (function () {
             var address = "LA MAROQUINERIE IN PARIS"; //$scope.concerts[i].VILLE;
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
             }*/
          }, function (error) {
          });
        });
      }

    }, function errorCallback(response) {
    });

//===============PLANNING MANAGER===================
    var foo = AuthService.getPlanning(); //update planning for one fisrt time
    $scope.addPlanning = function (date, location, title, cdeprog, id_bit) {
      AuthService.addPlanning(date, location, title, cdeprog, id_bit, verifyAction);
    };
    $scope.removePlanning = function (cdeprog, id_bit) {
      console.log("removing concert from planning with id" + id_bit);
      AuthService.delPlanning(cdeprog, id_bit,verifyAction);
    };
    $scope.isInPlanning = function(cdeprog, id_bit){
      return AuthService.isInPlanning(cdeprog, id_bit);
    };
    function verifyAction(authorized,actionSucceed){
      if (!authorized) {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Oups !',
          template: 'Please sign in to do this action',
          okText:'Sign in'
        });

        confirmPopup.then(function(res) {
          if(res) {
            $state.go('tab.profil');
          } else {
            console.log('Action annulé');
          }
        });
      } else if (!actionSucceed){
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
    //===========for the quicksearch modal
    /*$ionicModal.fromTemplateUrl('templates/quicksearch.html', {
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
    });*/


        $scope.printMore = function () {
          $scope.numLimit = $scope.numLimit + 5;
          if ($scope.numLimit > $scope.concerts.length) {
            $scope.isPlus = false;
          }
        };


  });
