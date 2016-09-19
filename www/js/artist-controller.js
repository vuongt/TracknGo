angular.module('starter.controllers').controller('ArtistCtrl', function($scope) {

  $scope.name="The Dumplings";
  A=["titre1", "titre2"];
  B=["titre3", "titre4"];
  $scope.albums=[{"name":"album1", "titres": A}, {"name":"album2", "titres": B}];



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

