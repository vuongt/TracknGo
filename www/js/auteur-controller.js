angular.module('starter.controllers').controller('AuteurCtrl', function($scope, $http, $ionicPopup, $stateParams) {
$scope.name= $stateParams.name;
$scope.isSong=true;

$http({
  method: 'GET',
  url: 'http://localhost:8080/author?name='+$scope.name,
  header:{
  Origin:'http://localhost:8100'
  }
}).then(function successCallback(response) {
    $scope.answer = response.data.works;
    $scope.error= response.data.error;
    console.log($scope.answer);
    $scope.isSong = false;
    if ($scope.error==""){
      if ($scope.answer.length !== 0){
        $scope.isSong = true;
        for(var i = 0, len = $scope.answer.length; i < len; i++) {
          var temp = $scope.answer[i].title.trim();
          $scope.answer[i].title = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
             if ($scope.answer[i].iswc.length != 0){
                        $scope.answer[i].isInfo = true;
                   }


        }
      }

     $scope.answer.sort(compare);


    } else {
      //Show an alert of the error
       $scope.answer.works[i].isInfo = false;
      var alertPopup = $ionicPopup.alert({
        title: "Error !",
        template: $scope.error
      });
      alertPopup.then(function(res) {
        console.log($scope.error);
      });
    }
  }, function errorCallback(error) {
  console.log(error);
  $scope.isSong = false;
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
window.history.back()  };


});


function compare(a,b) {
  if (a.title < b.title)
    return -1;
  if (a.title > b.title)
    return 1;
  return 0;
}

