angular.module('starter.controllers')
  .controller('ProfilCtrl', function($scope) {
    $scope.name = "Louise Legall";


//Les auteurs favoris
  A=["auteur1", "auteur2"];

  // Les morceaux favoris
  B=["titre1", "titre2"];

  $scope.nbrTitres= A.length;
  $scope.nbrAuteurs= B.length;


  $scope.albums=[{"name":"Auteur", "items": A}, {"name":"Titre", "items": B}];


  $scope.myGoBack = function() {
window.history.back()  };


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
  });
