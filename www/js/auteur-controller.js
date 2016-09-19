angular.module('starter.controllers').controller('AuteurCtrl', function($scope, $http) {



$scope.name= "goldman";
$scope.songs=[];
$scope.isSong=true;

$http({
  method: 'GET',
  url: 'http://localhost:8080/author?name='+$scope.name,
  header:{
  Origin:'http://localhost:8100'
}
}).then(function successCallback(response) {

    $scope.answer = response.data;

    for(var i = 0, len = $scope.answer.length; i < len; i++)
    {

        $scope.songs.push({
            titre : $scope.answer[i].title,
            iswc : $scope.answer[i].iswc,

        });

    }

$scope.isSong = true;


  }, function errorCallback(response) {

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

