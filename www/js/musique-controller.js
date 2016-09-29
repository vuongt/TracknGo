angular.module('starter.controllers').controller('MusiqueCtrl', function ($scope, $http, $stateParams, $state, $ionicPopup, $ionicHistory, AuthService,API_ENDPOINT) {
  $scope.iswc = $stateParams.iswc;
  $scope.title = $stateParams.title;
  $scope.myGoBack = function () {
    window.history.back()
  };
  $scope.chargingbeg = true;

  Date.prototype.yyyymmdd = function () {
    month = '' + (this.getMonth() + 1),
      day = '' + this.getDate();
      year = this.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  $scope.userdata = AuthService.getUserInfo();

  $scope.delFavoritesAuth = function (name) {
    AuthService.delFavoritesAuth(name,verifyAction);
    console.log("deleting author");
  };

  $scope.addFavoritesAuth = function (name) {
    AuthService.addFavoritesAuth(name,verifyAction);
    console.log("adding author");

  };

  $scope.delFavoritesArt = function (name) {
    AuthService.delFavoritesArt(name,verifyAction);
    $scope.userdata = AuthService.getUserInfo();
  };
  $scope.addFavoritesArt = function (name) {
    AuthService.addFavoritesArt(name,verifyAction);
    $scope.userdata = AuthService.getUserInfo();
  };


  $scope.isLikedAuth = function (name) {
    return (AuthService.isLikedAuth(name, $scope.userdata));
  };
  $scope.isLikedArt = function (name) {
    return (AuthService.isLikedArt(name, $scope.userdata));
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
      $scope.userdata = AuthService.getUserInfo();
    }
  }

  $scope.charging = false;

  $http({
    method: 'GET',
    url: 'http://localhost:8080/work?iswc=' + $scope.iswc,
    header: {
      Origin: 'http://localhost:8100'
    }
  }).then(function successCallback(response) {
    $scope.chargingbeg = false;

    $scope.answer = response.data;
    if ($scope.answer.error == "") {
      $scope.title = $scope.answer.title.charAt(0).toUpperCase() + $scope.answer.title.substring(1).toLowerCase();
      for (var i = 0, len = $scope.answer.composerAuthor.length; i < len; i++) {
        var temp = $scope.answer.composerAuthor[i].trim();
        $scope.answer.composerAuthor[i] = temp.charAt(0).toUpperCase() + temp.substring(1).toLowerCase();
      }
      $scope.isArtist = false;
      if ($scope.answer.performer.length != 0) {
        $scope.isArtist = true;
      }

      for (var i = 0, len = $scope.answer.performer.length; i < len; i++) {
        var temp = $scope.answer.performer[i].trim();
        $scope.answer.performer[i] = temp.charAt(0).toUpperCase() + temp.substring(1).toLowerCase();
      }
      console.log($scope.answer);

      $scope.isCharged = false;

    } else {
      //Show an alert of the error
      var alertPopup = $ionicPopup.alert({
        title: "Error !",
        template: $scope.answer.error
      });
      alertPopup.then(function (res) {
        console.log($scope.answer.error);
      });
      console.log($scope.answer);
    }
  }, function errorCallback(response) {
  });

  /*  $scope.printMore = function() {
   $scope.numLimit=$scope.numLimit+5;
   $route.reload();
   };*/


  $scope.myGoBack = function () {
    $ionicHistory.goBack();
  };


  $scope.chargeConcerts = function (iswc) {
    console.log('system retrieving concerts where' + iswc + 'is announced');
    $scope.charging = true;
    $http({
      method: 'GET',
      url: 'http://localhost:8080/work/program?iswc=' + iswc,
      header: {
        Origin: 'http://localhost:8100'
      }
    }).then(function successCallback(response) {
      $scope.concerts = response.data.concerts;
      console.log(response.data);
      if ($scope.answer.error == "") {
        $scope.isCharged = true;
        if ($scope.concerts.length != 0) {
          $scope.isConcert = true;

          $scope.concerts.forEach(function (item,index) {
            item.title = item.title.charAt(0).toUpperCase() + item.title.substring(1).toLowerCase();
            item.date = new Date(item.date);
            AuthService.isInPlanning(item.cdeprog, item.title,function (isInPlanning) {
              item.isInPlanning = isInPlanning;
            })

          });
          /*for (var i = 0, len = $scope.concerts.length; i < len; i++) {
            $scope.concerts[i].title = $scope.answer.concerts[i].title.charAt(0).toUpperCase() + $scope.concerts[i].title.substring(1).toLowerCase();
          }*/
        }
        else {
          $scope.isConcert = false;

        }

      } else {
        $scope.isCharged = false;
      }
    }, function errorCallback(response) {
      $scope.isCharged = false;
    });


  };

  $scope.addPlanning = function (date, location, title, cdeprog, id_bit) {
    console.log("adding concert with location:" + location);

    AuthService.addPlanning(date, location, title, cdeprog, id_bit);


  };
  $scope.removePlanning = function ( cdeprog, id_bit) {
    console.log("removing concert from planning with id" + id_bit);

    AuthService.delPlanning(cdeprog, id_bit);
  };


});

