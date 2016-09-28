angular.module('starter.services', [])

  .service('AuthService', function ($q, $http, API_ENDPOINT) {
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var isAuthenticated = false;
    var authToken;
    var userInfo = {};

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

    function storeUserInfo() {
      $http.get(API_ENDPOINT.url + '/profile').then(function (response) {
          userInfo.name = response.data.name;
          userInfo.works = response.data.works;
          userInfo.authors = response.data.authors;
          userInfo.artists =response.data.artists;
          console.log(userInfo);
      });
    }

    var register = function (user) {
      return $q(function (resolve, reject) {
        $http.post(API_ENDPOINT.url + '/signup', user, {header: {Origin: "http://localhost:8100"}}).then(function (result) {
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

    var login = function (user) {
      return $q(function (resolve, reject) {
        $http.post(API_ENDPOINT.url + '/signin', user).then(function (result) {
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

    var logout = function () {
      destroyUserCredentials();
    };

    loadUserCredentials();

    //==============FAVORITES SERVICE===============
    //Ajouter une chanson aux favoris
    var addFavorites = function (iswc, name) {
      $http({
        method: 'GET',
        url: 'http://localhost:8080/action/addfavorite?type=work&iswc=' + iswc + '+&title=' + name,
        header: {
          Origin: 'http://localhost:8100'
        }
      }).then(function successCallback(response) {
        if(!response.data.authorized) {
          console.log("!action unauthorized! please signin!");
        } else if(!response.data.actionSucceed){
          console.log("! failed to delete this song from your favorites !");
        } else {
          console.log("This song has been added");
        }
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });
    };

    //Supprimer une chanson des favoris
    var delFavorites = function (iswc, name) {
      console.log('la chanson ' + name + ' va être supprimée de vos favoris');
      $http({
        method: 'GET',
        url: 'http://localhost:8080/action/removefavorite?type=work&iswc=' + iswc + '&title=' + name,
        header: {
          Origin: 'http://localhost:8100'
        }
      }).then(function successCallback(response) {
        if(!response.data.authorized) {
          console.log("!action unauthorized! please signin!");
        } else if(!response.data.actionSucceed){
          console.log("! failed to delete this song from your favorites !");
        } else {
          console.log("This song has been added");
        }
        return ({action: response.data.actionSucceed, auth: response.data.authorized});
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });


    };

//Ajouter un auteur aux favoris
    var addFavoritesAuth = function (name) {
      $http({
        method: 'GET',
        url: 'http://localhost:8080/action/addfavorite?type=author&name=' + name,
        header: {
          Origin: 'http://localhost:8100'
        }
      }).then(function successCallback(response) {
        if(!response.data.authorized) {
          console.log("!action unauthorized! please signin!");
        } else if(!response.data.actionSucceed){
          console.log("! failed to delete this author from your favorites !");
        } else {
          console.log("This author has been added");
        }
        return ({action: response.data.actionSucceed, auth: response.data.authorized});
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });


    };


    //Supprimer une chanson des favoris
    var delFavoritesAuth = function (name) {
      console.log('cet auteur ' + name + ' va être supprimée de vos favoris');
      $http({
        method: 'GET',
        url: 'http://localhost:8080/action/removefavorite?type=author&name=' + name,
        header: {
          Origin: 'http://localhost:8100'
        }
      }).then(function successCallback(response) {
        if(!response.data.authorized) {
          console.log("!action unauthorized! please signin!");
        } else if(!response.data.actionSucceed){
          console.log("! failed to delete this author from your favorites !");
        } else {
          console.log("This author has been added");
        }
        return ({action: response.data.actionSucceed, auth: response.data.authorized});
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
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
        if(!response.data.authorized) {
          console.log("!action unauthorized! please signin!");
        } else if(!response.data.actionSucceed){
          console.log("! failed to delete this artist from your favorites !");
        } else {
          console.log("This artist has been added");
        }
        return ({action: response.data.actionSucceed, auth: response.data.authorized});
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });
    };

    //Supprimer un artist des favoris
    var delFavoritesArt = function(name) {
      console.log('cet auteur '+name+' va être supprimée de vos favoris');
      $http({
        method: 'GET',
        url: 'http://localhost:8080/action/removefavorite?type=artist&name='+name,
        header:{
          Origin:'http://localhost:8100'
        }
      }).then(function successCallback(response) {
        if(!response.data.authorized) {
          console.log("!action unauthorized! please signin!");
        } else if(!response.data.actionSucceed){
          console.log("! failed to delete this artist from your favorites !");
        } else {
          console.log("This artist has been added");
        }
        return({action: response.data.actionSucceed, auth: response.data.authorized});
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });
    };

    var isLiked = function (iswc, userdata) {
      for (var l = 0; l < userdata.works.length; l++) {
        if (iswc == userdata.works[l].iswc) {
          return true;
        }
      }
      return false;
    };

    var isLikedAuth = function (name, userdata) {
      for (var k = 0; k < userdata.authors.length; k++) {
        if (name == userdata.authors[k].name) {
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

    //===================PLANNING=======================

    var addPlanning = function (date, location, title, cdeprog, id_bit) {
      if (cdeprog) {
        $http({
          method: 'GET',
          url: 'http://localhost:8080/action/addevent?cdeprog=' + cdeprog + '&title=' + title + '&location=' + location + '&date=' + date,
          header: {
            Origin: 'http://localhost:8100'
          }
        }).then(function successCallback(response) {

          console.log("This concert has been added");

          return ({action: response.data.actionSucceed, auth: response.data.authorized});


        }, function errorCallback(response) {

          console.log("! failed to delete this concert from your planning !");

        });
      }
      else {
        $http({
          method: 'GET',
          url: 'http://localhost:8080/action/addevent?title=' + title + '&location=' + location + '&date=' + date +'&id_bit=' + id_bit,
          header: {
            Origin: 'http://localhost:8100'
          }
        }).then(function successCallback(response) {

          console.log("This concert has been added with date: " + date);

          return ({action: response.data.actionSucceed, auth: response.data.authorized});


        }, function errorCallback(response) {

          console.log("! failed to delete this concert from your planning !");
        });
      }

    };

    var delPlanning = function (cdeprog, idBit) {
      console.log("test service with cdeprog" + cdeprog);

      if(cdeprog){
        $http({
          method: 'GET',
          url: 'http://localhost:8080/action/removeevent?cdeprog=' + cdeprog,
          header: {
            Origin: 'http://localhost:8100'
          }
        }).then(function successCallback(response) {

          return ({action: response.data.actionSucceed, auth: response.data.authorized});


        }, function errorCallback(response) {


        });
      } else {
        $http({
          method: 'GET',
          url: 'http://localhost:8080/action/removeevent?id_bit=' + idBit,
          header: {
            Origin: 'http://localhost:8100'
          }
        }).then(function successCallback(response) {
          console.log("réussi? : " + response.data.actionSucceed);
          return ({action: response.data.actionSucceed, auth: response.data.authorized});


        }, function errorCallback(response) {


        });
      }


    };

    var isInPlanning = function (cdeprog, title, callback) {
      $http({
        method: 'GET',
        url: 'http://localhost:8080/planning',
        header: {
          Origin: 'http://localhost:8100'
        }
      }).then(function successCallback(response) {

        var results = response.data.events;
        console.log(title);
        for (var i = 0; i < results.length; i++) {
          if (cdeprog) {
            if (results[i].cdeprog == cdeprog) {
              return callback(true);
            }
          } else {
            if (results[i].title == title) {
              console.log("test");

              return callback(true);
            }
          }


        }

        return callback(false)
      });
    };


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
      isInPlanning: isInPlanning,
      addPlanning: addPlanning,
      delPlanning: delPlanning,
      delFavoritesArt: delFavoritesArt,
      addFavoritesArt: addFavoritesArt,
      isLikedArt: isLikedArt,
      getUserInfo: function () {
        storeUserInfo();
        return userInfo;
      },
      isAuthenticated: function () {
        return isAuthenticated;
      }
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
