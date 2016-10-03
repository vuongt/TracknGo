angular.module('starter.controllers').controller('ConcertCtrl', function (AuthService,$scope, $ionicModal, $state, $http,$stateParams,$ionicPopup,API_ENDPOINT) {

  $scope.cdeprog= $stateParams.cdeprog;
  $scope.date= $stateParams.date;
  $scope.title= $stateParams.title;
  $scope.location= $stateParams.location;
  console.log($scope.title);


  $scope.userdata = AuthService.getUserInfo();
  $scope.userPlanning = AuthService.getPlanning();
  $scope.isLiked = function(iswc){return(AuthService.isLiked(iswc, $scope.userdata));};
  $scope.delFavorites = function(iswc, name){
      AuthService.delFavorites(iswc, name);
      $scope.userdata = AuthService.getUserInfo();
  };
  $scope.addFavorites = function(iswc, name){
       AuthService.addFavorites(iswc, name);
       $scope.userdata = AuthService.getUserInfo();
  };
  $scope.addPlanning = function (date, location, title, cdeprog,idBit) {
    AuthService.addPlanning(date, location, title, cdeprog, idBit, verifyAction);
  };
  $scope.removePlanning = function (cdeprog, idBit) {
    console.log("removing concert from planning");
    AuthService.delPlanning(cdeprog, idBit,verifyAction);
  };
  $scope.isInPlanning = function(cdeprog,idBit){
    return AuthService.isInPlanning(cdeprog,idBit);
  };

  $scope.noProgram = false;
  $scope.charging=true;
$http({
  method: 'GET',
  url: API_ENDPOINT.url + '/program?cdeprog='+$scope.cdeprog,
  header:{
    Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {
  $scope.answer = response.data;
  console.log(response.data);
  $scope.setList = $scope.answer.setList;
  $scope.charging=false;
    if ($scope.setList.length!==0 && $scope.answer.error==""){
      $scope.noProgram = false;
      /*$scope.title=$scope.answer.title.charAt(0).toUpperCase()+ $scope.answer.title.substring(1).toLowerCase();
      $scope.location=$scope.answer.location.charAt(0).toUpperCase()+ $scope.answer.location.substring(1).toLowerCase();
      $scope.date=$scope.answer.date;*/
      $scope.isSong=false;
      for(var i = 0, len = $scope.setList.length; i < len; i++) {
                $scope.isSong=true;
                var temp = $scope.setList[i].title.trim();
                $scope.setList[i].title = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
                $scope.setList[i].isInfo = false;
                   if ($scope.setList[i].iswc.length != 0){
                              $scope.setList[i].isInfo = true;
                   }
      }
    } else {
      $scope.noProgram=true;
    }
  }, function errorCallback(response) {
  });

//Revenir en arrière

  $scope.myGoBack = function () {
    window.history.back()
  };

  $scope.comments = [];
  $scope.empty ="";
//====================COMMENT=======================
//get commentaire
  var getComment = function(){
    $http({
      method: 'GET',
      url: API_ENDPOINT.url + '/comment?cdeprog='+$scope.cdeprog,
      header: {
        Origin: 'http://localhost:8100'
      }
    }).then(function successCallback(response) {
      if (response.data.error) {
        console.log(response.data.error);
      } else {
        $scope.comments = response.data;
        console.log("comments: ");
        console.log($scope.comments);
      }
    }, function errorCallback(error) {
      console.log(error);
    });
  };
  getComment();

//post comment
  $scope.submit = function(contentComment){
    send(contentComment,verifyAction);
    this.contentComment = null;
  };

  function send(contentComment,verifyAction){
    console.log(contentComment);
    console.log(new Date());
    if(contentComment && contentComment!==""){
      $http({
        method: 'POST',
        url: API_ENDPOINT.url + '/comment?cdeprog='+$scope.cdeprog,
        header: {
          Origin: 'http://localhost:8100'
        },
        data:{
          cdeprog:$scope.cdeprog,
          content:contentComment,
          date: new Date() //TODO timezone ?
        }
      }).then(function successCallback(response) {
        if (response.data.error) {
          return console.log(response.data.error);
          //TODO popup
        }
        verifyAction(response.data.authorized,response.data.actionSucceed);
      }, function errorCallback(error) {
        console.log(error);
      });
    }else {
      var alertPopup = $ionicPopup.alert({
        title:"Oups !",
        template:"Your comment is empty !"
      })
    }
    this.contentComment = null;
    //TODO clear field after sending
    getComment();
  }

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
      $scope.userPlanning = AuthService.getPlanning();
    }
  }


});



