angular.module('starter.controllers').controller('ConcertCtrl', function (AuthService,$scope, $ionicModal, $state, $http,$stateParams,$ionicPopup,API_ENDPOINT) {

  $scope.cdeprog= $stateParams.cdeprog;
  $scope.datedbt= $stateParams.datedbt;
  $scope.datefin= $stateParams.datefin; //TODO date format
  $scope.title= $stateParams.title;
  $scope.location= $stateParams.location;


  /*$scope.cdeprog= "0008201463"; // TODO delete this in prod
  $scope.date= "2016-09-16T22:00:00.000Z";
  $scope.title= "Concert Tribute to Balavoine";
  $scope.location= "SOUFFLENHEIM";
  console.log("accessing detail of program: " + $scope.cdeprog);*/


  $scope.userdata = AuthService.getUserInfo();
  $scope.isLiked = function(iswc){return(AuthService.isLiked(iswc, $scope.userdata));};
  $scope.delFavorites = function(iswc, name){
      AuthService.delFavorites(iswc, name);
      $scope.userdata = AuthService.getUserInfo();
  };
  $scope.addFavorites = function(iswc, name){
       AuthService.addFavorites(iswc, name);
       $scope.userdata = AuthService.getUserInfo();
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
// Gestion des commentaires
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
        console.log($scope.comments);
      }
    }, function errorCallback(error) {
      console.log(error);
    });
  };
  getComment();

//post comment
  $scope.submit = function(contentComment){
    console.log(contentComment);
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
          console.log(response.data.error);
          //TODO popup
        }
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
  };


});



