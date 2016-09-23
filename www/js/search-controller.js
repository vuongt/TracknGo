angular.module('starter.controllers')


.controller('SearchCtrl', ['$rootScope', '$scope', '$http', "$stateParams", "$ionicPopup", function($rootScope, $scope, $http, $stateParams, $ionicPopup, $route, AuthService, $filter){
  //$scope.isConcert = false;
  $scope.isSong = false;
  $scope.isPlus = false;
  $scope.userinfo=["T-904.824.279.1", "T-904.795.074.3"];
  $scope.filter= "parties,titles,subtitles,performers";
  $scope.nbrPage=1;
  //$scope.concerts == [];
    $scope.submitSearch = function(search, filter){


            $http({
              method: 'GET',
              url: 'http://localhost:8080/search/works?query='+search+'&filters='+filter+'&page='+$scope.nbrPage,
              header:{
              Origin:'http://localhost:8100'
            }
}).then(function successCallback(response) {
    $scope.answer = response.data.results;
    $scope.error = response.data.error;
     $scope.isSong = false;
     $scope.isPlus= false;


   $scope.numLimit=5;


    if (response.data.error ==""){
      console.log($scope.answer);
      for(var i = 0, len = $scope.answer.length; i < len; i++)
      {
        var temp = $scope.answer[i].title.trim();
        $scope.answer[i].title = temp.charAt(0).toUpperCase()+ temp.substring(1).toLowerCase();
         if ($scope.answer[i].iswc.length != 0){
              $scope.answer[i].isInfo = true;
         }
              if ($scope.answer.length!=0){

                $scope.isSong=true;
                if ($scope.numLimit<=len){$scope.isPlus = true;}



                      }

              if ($scope.userinfo.length!=0){

                   if (inArray($scope.answer[i].iswc,$scope.userinfo) && $scope.answer[i].isInfo==true)
                      {$scope.answer[i].isLiked=true;}

                   else
                    {$scope.answer[i].isLiked=false;}


              }
        }

        if ($scope.answer.length<100){
        $scope.maxResults=$scope.answer.length;
        }

        $scope.answer.sort(compare);
      }



    else {
      //Show an alert of the error
      if (response.data.error ==""){
     $scope.answer[i].isInfo= false;}
      var alertPopup = $ionicPopup.alert({
        title: "Recherche impossible !",
        template: $scope.error
      });
      alertPopup.then(function(res) {
        console.log($scope.error);
      });
    }
  }, function errorCallback(response) {

  });
  }


  $scope.printMore = function() {
$scope.numLimit=$scope.numLimit+5;

  if ($scope.numLimit>95){

  $scope.nbrPage =  $scope.nbrPage+1;
  }

  if ($scope.numLimit>=$scope.maxResults){$scope.isPlus = false;}


  };

  $scope.changeFavorites = function(iswc, name, isLiked) {

      if (isLiked==true){
        $http({
              method: 'GET',
              url: 'http://localhost:8080/action/addfavorite?type=work&iswc='+iswc+'+&title='+name,
              header:{
              Origin:'http://localhost:8100'
            }
            }).then(function successCallback(response) {

                console.log("This song has been added");


              }, function errorCallback(response) {

              });


              }

      if (isLiked=false){

         $http({
                       method: 'GET',
                       url: 'http://localhost:8080/action/removefavorite?type=work&iswc='+iswc+'&title'+name,
                       header:{
                       Origin:'http://localhost:8100'
                     }
                     }).then(function successCallback(response) {

                         console.log("This song has been deleted");

                       }, function errorCallback(response) {

                       });

      }

  };


  }]);

  function inArray(needle,haystack)
  {
      var count=haystack.length;
      for(var i=0;i<count;i++)
      {
          if(haystack[i]===needle){return true;}
      }
      return false;
  }


function compare(a,b) {
  if (a.title < b.title)
    return -1;
  if (a.title > b.title)
    return 1;
  return 0;
}
