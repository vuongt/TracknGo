angular.module('starter.controllers').controller('ArtistCtrl', function ($scope, $http, $stateParams, $state, $ionicPopup, $ionicHistory, AuthService,API_ENDPOINT) {
  $scope.name = $stateParams.name;
  //$scope.concerts=[];
  //$scope.songs=[];
  $scope.numLimit = 5;
  $scope.isPlus = false;
  Date.prototype.yyyymmdd = function () {
    month = '' + (this.getMonth() + 1),
      day = '' + this.getDate(),
      year = this.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };
 $scope.charging=true;

  $scope.userdata = AuthService.getUserInfo();

//=================Favorite Manager=====================
  $scope.isLiked = function (iswc) {
       return(AuthService.isLiked(iswc, $scope.userdata));
  };
  $scope.delFavorites = function (iswc, name) {
    AuthService.delFavorites(iswc, name, verifyAction);
  };
    $scope.addFavorites = function(iswc, name){
         AuthService.addFavorites(iswc, name, verifyAction);
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

  //==============GET Information=======================
$http({
  method: 'GET',
  url: API_ENDPOINT.url + '/artist?name='+$scope.name,
  header:{
    Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {
console.log(response.data);
$scope.charging=false;
    $scope.answer = response.data;
    $scope.numLimit = 5;
    $scope.error = $scope.answer.error;
    $scope.isSong = false;
    $scope.isConcert = false;
    $scope.isPlus = false;
    if ($scope.error == "") {
      if ($scope.answer.works.length !== 0) {
        $scope.isSong = true;
        for (var i = 0, len = $scope.answer.works.length; i < len; i++) {
        console.log($scope.answer.works[i]);
          $scope.answer.works[i].title = $scope.answer.works[i].title.charAt(0).toUpperCase() + $scope.answer.works[i].title.substring(1).toLowerCase();
          $scope.answer.works[i].isInfo = false;
          if ($scope.answer.works[i].iswc.length != 0) {
            $scope.answer.works[i].isInfo = true;
          }
        }
        if ($scope.numLimit <= len) {
          $scope.isPlus = true;
        }
      }
      if ($scope.answer.concerts.length !== 0) {
        $scope.answer.concerts.forEach(function (item,index) {
          item.datetime = new Date(item.datetime);
          AuthService.isInPlanning(item.cdeprog, item.title,function (isInPlanning) {
            item.isInPlanning = isInPlanning;
          })

        });

        /*for (var j = 0; j < $scope.answer.concerts.length; j++) {
          $scope.answer.concerts[j].datetime = new Date($scope.answer.concerts[j].datetime);
          // test isInPlanning
          AuthService.isInPlanning($scope.answer.concerts[j].cdeprog,$scope.answer.concerts[j].title,function (isInPlanning) {
            $scope.answer.concerts[j].isInPlanning = isInPlanning;
          } )


        }*/
        $scope.isConcert = true;
      }


      $scope.answer.works.sort(compare);
      $scope.maxResults = $scope.answer.works.length;


    } else {
      //Show an alert of the error
      $scope.answer.works[i].isInfo = false;

      var alertPopup = $ionicPopup.alert({
        title: "Error !",
        template: $scope.error
      });
      alertPopup.then(function (res) {
        console.log($scope.error);
      });
    }
  }, function errorCallback(response) {


    $scope.isSong = false;
    $scope.isConcert = false;


  });

  //add planning

  $scope.addPlanning = function (date, location, title, cdeprog, id_bit) {
    console.log("adding concert with location:" + location);

    AuthService.addPlanning(date, location, title, cdeprog, id_bit);


  };
  $scope.removePlanning = function ( cdeprog, id_bit) {
    console.log("removing concert from planning with id" + id_bit);

    AuthService.delPlanning(cdeprog, id_bit);


  };


  $scope.myGoBack = function () {
    $ionicHistory.goBack();
    console.log($ionicHistory.viewHistory());

    if ($ionicHistory.viewHistory().backViewId.length == 1) {
      $ionicHistory.clearHistory();
      $route.reload();

    }


    console.log($ionicHistory.viewHistory());

  };


  $scope.printMore = function () {
    $scope.numLimit = $scope.numLimit + 5;


    if ($scope.numLimit >= $scope.maxResults) {
      $scope.isPlus = false;
    }


  };

});


function compare(a, b) {
  if (a.title < b.title)
    return -1;
  if (a.title > b.title)
    return 1;
  return 0;
}



