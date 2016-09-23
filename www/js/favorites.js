angular.module('starter.services', [])
.service("FavoriteService",[function(AuthService){


//ATTENTION: il faut encore ajouter le cas, non traité ici où la chanson n'a pas d'iswc...


// Charger les chansons préférées ici à parir de la BDD

 $scope.favoris=["T-904.824.279.1", "T-904.795.074.3"];



//Ajouter une chanson aux favoris
    this.addFavorites = function(iswc, name) {


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


             };


//Supprimer une chanson des favoris
    this.delFavorites = function(iswc, name) {

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



      };

)}


//fonction pour tester si une musique appartient aux favoris


function isLiked(iswc, name) {


      if (favorites!=0){

      if (name,favorites))
          {return true;}

      else
          {return false;}


       }

}


function inArray(needle,haystack)
  {
      var count=haystack.length;
      for(var i=0;i<count;i++)
      {
          if(haystack[i]===needle){return true;}
      }
      return false;
  }
