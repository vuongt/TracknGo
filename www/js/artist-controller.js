angular.module('starter.controllers').controller('ArtistCtrl', function($scope, $http, $stateParams,$state, $ionicPopup, $ionicHistory){
  $scope.name = $stateParams.name;
  //$scope.concerts=[];
  //$scope.songs=[];
  $scope.numLimit=5;
    $scope.isPlus = false;

console.log($ionicHistory.currentView());

$http({
  method: 'GET',
  url: 'http://localhost:8080/artist?name='+$scope.name,
  header:{
    Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {
    $scope.answer = response.data;
    console.log($scope.answer);
    $scope.numLimit=5;
    $scope.error = $scope.answer.error;
    $scope.isSong = false;
    $scope.isConcert = false;
    $scope.isPlus = false;

    if ($scope.error==""){
      if ($scope.answer.works.length !== 0){
        $scope.isSong = true;
        for(var i = 0, len = $scope.answer.works.length; i < len; i++) {
          var temp = $scope.answer.works[i].title.trim();
          $scope.answer.works[i].title = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
          if ($scope.answer.works[i].iswc.length != 0){
                        $scope.answer.works[i].isInfo = true;
                   }
        }

     if ($scope.numLimit<=len){$scope.isPlus = true;}

      }
      if ($scope.answer.concerts.length !==0){
        $scope.isConcert = true;
      }


       $scope.answer.works.sort(compare);
        $scope.maxResults=$scope.answer.works.length;



    } else {
      //Show an alert of the error
           $scope.answer.works[i].isInfo= false;

      var alertPopup = $ionicPopup.alert({
        title: "Error !",
        template: $scope.error
      });
      alertPopup.then(function(res) {
        console.log($scope.error);
      });
    }
  }, function errorCallback(response) {


$scope.isSong=false;
$scope.isConcert= false;

  });

  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };


  $scope.myGoBack = function() {
  $ionicHistory.goBack();
  console.log($ionicHistory.viewHistory());

  if ($ionicHistory.viewHistory().backViewId.length==1){
   $ionicHistory.clearHistory();
   $route.reload();

  }


  console.log($ionicHistory.viewHistory());

  };



  $scope.printMore = function() {
$scope.numLimit=$scope.numLimit+5;


  if ($scope.numLimit>=$scope.maxResults){$scope.isPlus = false;}


  };

});



function compare(a,b) {
  if (a.title < b.title)
    return -1;
  if (a.title > b.title)
    return 1;
  return 0;
}



