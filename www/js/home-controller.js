angular.module('starter.controllers')
  .controller('HomeCtrl', function ($scope, $state, $cordovaGeolocation, $http, $ionicModal, AuthService, API_ENDPOINT, $stateParams, $ionicPopup ) {


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
    $scope.lat = "";
    $scope.lng = "";
    $scope.radius = "50";
    $scope.start = "";
    $scope.end = "";
    $scope.timeCriteria = "aujourd'hui";
    if ($stateParams.lat && $stateParams.lat !== "") {
      $scope.lat = parseFloat($stateParams.lat);
    }
    if ($stateParams.lng && $stateParams.lng !== "") {
      $scope.lng = parseFloat($stateParams.lng);
    }
    console.log($scope.lat);


    if($stateParams.radius && $stateParams.radius!=="") {$scope.radius=$stateParams.radius;}
    if($stateParams.start && $stateParams.start!=="" && $stateParams.end && $stateParams.end!=="") {
      $scope.start=new Date($stateParams.start);
      $scope.end= new Date($stateParams.end);
      $scope.timeCriteria = "du " + $scope.start.toLocaleDateString() + " au " + $scope.end.toLocaleDateString() + " dans un rayon de "+$scope.radius +" km";
    }

  var attentionAuTemps = setTimeout(function(){

  $scope.charging=false;
  $scope.isConcertHome=false;
$scope.isPlus=false;

  },15000);



  $http({
  method: 'GET',
  url: API_ENDPOINT.url + '/search/concerts?lng='+$scope.lng+'&lat='+$scope.lat+'&radius='+$scope.radius+'&start='+$scope.start+'&end='+$scope.end,
  header:{
    Origin:'http://localhost:8100'
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
        console.log($scope.concerts);

        if ($scope.concerts.length != 0) {
          $scope.isConcertHome = true;

          if ($scope.numLimit <= $scope.concerts.length) {
            $scope.isPlus = true;
          }

        } else {
          $scope.charging = false;
        }
        $scope.concerts.forEach(function (item, index) {

        if (item.haveProgram=="NO"){item.haveProgram=false};
        if (item.haveProgram=="YES"){item.haveProgram=true};

       item.TITRPROG = item.TITRPROG.charAt(0).toUpperCase() + item.TITRPROG.substring(1).toLowerCase();
       item.NOM = item.NOM.charAt(0).toUpperCase() + item.NOM.substring(1).toLowerCase();
       item.VILLE = item.VILLE.charAt(0).toUpperCase() + item.VILLE.substring(1).toLowerCase();

          if (item.TITRPROG == "Manifestation de _artiste a preciser ...") {
            if (item.NOM == "Salle non referencee" || item.NOM == "" || item.NOM == " . . .") {
              item.TITRPROG = "Manifestation @ " + item.VILLE;

              item.NOM = "";
            }
            else {
              item.TITRPROG = "Manifestation @ " + item.NOM;

              item.NOM = "";
            }
          }
          if (item.ADR == " . . .") {
            item.ADR = "";

          }
          else {
            length = item.ADR.length;
            item.ADR = item.ADR.slice(0, length - 2);
          }

          item.DATDBTDIF = new Date(item.DATDBTDIF);
          //item.id_bit is undefined 'cause these concerts come from Eliza
        });


        //initialisation google maps
        var init = function () {

          var mapOptions = {
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          var div = document.getElementById('map');
          console.log(div);

          $scope.map = new google.maps.Map(div, mapOptions);

          console.log(div);

          var options = {timeout: 10000, enableHighAccuracy: true};



          var mapOptions = {
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };


          $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

            if($scope.lat){
            $scope.map.setCenter({ lat:$scope.lat, lng:$scope.lng});
            } else {
              var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              $scope.map.setCenter(latLng);
            }


            console.log($scope.map.center.lat());
            //creation de la fonction isOpen a infowindow
            function isInfoWindowOpen(infoWindow) {
              var map = infoWindow.getMap();
              return (map !== null && typeof map !== "undefined");
            }

            google.maps.event.addListenerOnce($scope.map, 'idle', function () {


              google.maps.event.trigger($scope.map, 'resize');



              $scope.concerts.forEach(function (item, index) {
                var marker = new google.maps.Marker({
                  map: $scope.map,
                  animation: google.maps.Animation.DROP,
                  position: {lat: parseFloat(item.LAT), lng : parseFloat(item.LNG)}
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

              });

            }, function (error) {
            });
          });

          google.maps.event.trigger( $scope.map, 'resize');

        };

        init();

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
            console.log('Action annulé');
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
