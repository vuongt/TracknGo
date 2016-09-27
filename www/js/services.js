angular.module('starter.services', [])

  .service('AuthService', function($q, $http, API_ENDPOINT) {
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var isAuthenticated = false;
    var authToken;
    var userInfo={};

    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        useCredentials(token);
      }
    }

    function storeUserCredentials(token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      useCredentials(token);
    }

    function useCredentials(token) {
      isAuthenticated = true;
      authToken = token;

      // Set the token as header for your requests!
      $http.defaults.headers.common.Authorization = authToken;
    }

    function destroyUserCredentials() {
      authToken = undefined;
      isAuthenticated = false;
      $http.defaults.headers.common.Authorization = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    function storeUserInfo(){
      $http.get(API_ENDPOINT.url + '/profile').then(function (response) {
          userInfo.name = response.data.name;
          userInfo.works = response.data.works;
          userInfo.authors = response.data.authors;
          userInfo.artists =response.data.artists;
          console.log(userInfo);
      });
    }

    var register = function(user) {
      return $q(function(resolve, reject) {
        $http.post(API_ENDPOINT.url + '/signup', user, {header: {Origin:"http://localhost:8100"}}).then(function(result) {
          if (result.data.success) {
            storeUserCredentials(result.data.token);
            storeUserInfo();
            resolve(result.data.msg);
          } else {
            reject(result.data.msg);
          }
        });
      });
    };

    var login = function(user) {
      return $q(function(resolve, reject) {
        $http.post(API_ENDPOINT.url + '/signin', user).then(function(result) {
          if (result.data.success) {
            storeUserCredentials(result.data.token);
            storeUserInfo();
            resolve(result.data.msg);
          } else {
            reject(result.data.msg);
          }
        });
      });
    };

    var logout = function() {
      destroyUserCredentials();
    };

    loadUserCredentials();

    //FAVORITES SERVICE

    console.log('favorites services fonctionne');

    //Ajouter une chanson aux favoris
    var addFavorites = function(iswc, name) {


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
    var delFavorites = function(iswc, name) {


    console.log('cette chanson '+name+' va être supprimée de vos favoris');


                      $http({
                               method: 'GET',
                               url: 'http://localhost:8080/action/removefavorite?type=work&iswc='+iswc+'&title='+name,
                               header:{
                               Origin:'http://localhost:8100'
                             }
                             }).then(function successCallback(response) {

                                return({action: response.data.actionSucceed, auth: response.data.authorized});


                               }, function errorCallback(response) {

                                 console.log("! failed to delete this song from your favorites !");

                               });



          };


//Ajouter un auteur aux favoris

    var addFavoritesAuth = function(name) {
console.log("BOUM");

                $http({
                      method: 'GET',
                      url: 'http://localhost:8080/action/addfavorite?type=author&name='+name,
                      header:{
                      Origin:'http://localhost:8100'
                    }
                    }).then(function successCallback(response) {




                      }, function errorCallback(response) {

                      });


                 };


    //Supprimer une chanson des favoris
    var delFavoritesAuth = function(name) {


    console.log('cet auteur '+name+' va être supprimée de vos favoris');


                      $http({
                               method: 'GET',
                               url: 'http://localhost:8080/action/removefavorite?type=author&name='+name,
                               header:{
                               Origin:'http://localhost:8100'
                             }
                             }).then(function successCallback(response) {

                                return({action: response.data.actionSucceed, auth: response.data.authorized});


                               }, function errorCallback(response) {



                               });



          };


//Ajouter un artiste aux favoris

    var addFavoritesArt = function(name) {


                $http({
                      method: 'GET',
                      url: 'http://localhost:8080/action/addfavorite?type=artist&name='+name,
                      header:{
                      Origin:'http://localhost:8100'
                    }
                    }).then(function successCallback(response) {




                      }, function errorCallback(response) {

                      });


                 };


    //Supprimer une chanson des favoris
    var delFavoritesArt = function(name) {


    console.log('cet auteur '+name+' va être supprimée de vos favoris');


                      $http({
                               method: 'GET',
                               url: 'http://localhost:8080/action/removefavorite?type=artist&name='+name,
                               header:{
                               Origin:'http://localhost:8100'
                             }
                             }).then(function successCallback(response) {

                                return({action: response.data.actionSucceed, auth: response.data.authorized});


                               }, function errorCallback(response) {



                               });



          };




    var isLiked = function (iswc, userdata) {



      for (var l=0;l<userdata.works.length;l++){
          if (iswc == userdata.works[l].iswc){
                return true;
                }
      }
    return false;
    };



    var isLikedAuth = function (name, userdata) {



          for (var k=0;k<userdata.authors.length;k++){
              if (name == userdata.authors[k].name){
                    return true;
                    }
          }
        return false;
    };

    var isLikedArt = function (name, userdata) {



          for (var k=0;k<userdata.artists.length;k++){
              if (name == userdata.artists[k].name){
                    return true;
                    }
          }
        return false;
    };

//Add an interprete to your favorites




    return {
      login: login,
      register: register,
      logout: logout,
      isLiked: isLiked,
      isLikedAuth: isLikedAuth,
      delFavorites: delFavorites,
      addFavorites: addFavorites,
      delFavoritesAuth: delFavoritesAuth,
      addFavoritesAuth: addFavoritesAuth,
       delFavoritesArt: delFavoritesArt,
      addFavoritesArt: addFavoritesArt,
      isLikedArt: isLikedArt,
      getUserInfo : function() {
      storeUserInfo();
      return userInfo;},
      isAuthenticated: function() {return isAuthenticated;}
    };
  })
/*AuthInterceptor to broadcast a global event if we encounter a 401 response,
which means we are not authenticated anymore for some reasons*/
  .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    return {
      responseError: function (response) {
        $rootScope.$broadcast({
          401: AUTH_EVENTS.notAuthenticated,
        }[response.status], response);
        return $q.reject(response);
      }
    };
  })

  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
