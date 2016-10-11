angular.module('starter.services', [])

// Les différents services developpés ici sont utilisés dans les controlleurs des différentes fonctionnalités de l'appli.
// Ces services sont surtout liés à la version 2
// Il s'agit: d'ajouter des élements aux favoris, de gérer le planning, de gérer l'identification des utilisateurs

// ========================== SERVICES DE TRACK N GO =======================================
  .service('AuthService', function ($q, $http, API_ENDPOINT) {



  // ==================================== SERVICES D IDENTIFICATION (login, userdatas...) ==============================
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var isAuthenticated = false;
    var authToken;
    var userInfo = {};
    var userPlanning=[];



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
      $http.get(API_ENDPOINT.url + '/logout').then(function(response){
        console.log('logout request sent to server');
      });
      authToken = undefined;
      isAuthenticated = false;
      userInfo = {};
      userPlanning =[];
      $http.defaults.headers.common.Authorization = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    function storeUserInfo() {
      $http.get(API_ENDPOINT.url+'/profile').then(function (response) {
          userInfo.name = response.data.name;
          userInfo.works = response.data.works;
          userInfo.authors = response.data.authors;
          userInfo.artists =response.data.artists;
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
            updatePlanning();
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


    //Ajouter une chanson aux favoris. Cette fonction est utilisée par différents controlleurs.
    // L'ajout aux favoris se fait via l'appel d'un url auquel on envoie code iswc et nom du favori

    function addFavorites(iswc, name, cb) {
      $http({
        method: 'GET',
        url: API_ENDPOINT.url + '/action/addfavorite?type=work&iswc=' + iswc + '+&title=' + name,
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
        cb(response.data.authorized,response.data.actionSucceed);
      }, function errorCallback(response) {

        console.log("error when connecting to server");
        console.log(response);
      });
    }

    //Supprimer une chanson des favoris. Cette fonction est utilisée par différents controlleurs.
  // La suppression se fait via un appel au serveur auquel on envoie code iswc et nom
    function delFavorites(iswc, name,cb) {
      console.log('la chanson ' + name + ' va être supprimée de vos favoris');
      $http({
        method: 'GET',
        url: API_ENDPOINT.url + '/action/removefavorite?type=work&iswc=' + iswc + '&title=' + name,
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
        cb(response.data.authorized,response.data.actionSucceed);
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });

    }

    //Ajouter un auteur aux favoris. Cette fonction est utilisée par différents controlleurs.

    function addFavoritesAuth(name,cb) {
    // Appel au serveur
      $http({
        method: 'GET',
        url: API_ENDPOINT.url + '/action/addfavorite?type=author&name=' + name,
        header: {
          Origin: 'http://localhost:8100'
        }
      }).then(function successCallback(response) {
      // La réponse est renvoyée par le serveur: différents cas, soit on est connecté, soit on ne l'est pas, soit le favoris a été ajouté
        if(!response.data.authorized) {
          console.log("!action unauthorized! please signin!");
        } else if(!response.data.actionSucceed){
          console.log("! failed to delete this author from your favorites !");
        } else {
          console.log("This author has been added");
        }
        cb(response.data.authorized,response.data.actionSucceed);
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });
    }


    //Supprimer une chanson des favoris
    // La suppression se fait via un appel du serveur. Cette fonction est utilisée par différents controlleurs.
    function delFavoritesAuth(name,cb) {
      console.log('cet auteur ' + name + ' va être supprimée de vos favoris');
      $http({
        method: 'GET',
        url: API_ENDPOINT.url +'/action/removefavorite?type=author&name=' + name,
        header: {
          Origin: 'http://localhost:8100'
        }
      }).then(function successCallback(response) {
      // Différentes réponses possibles qu'il faut traiter
        if(!response.data.authorized) {
          console.log("!action unauthorized! please signin!");
        } else if(!response.data.actionSucceed){
          console.log("! failed to delete this author from your favorites !");
        } else {
          console.log("This author has been added");
        }
        cb(response.data.authorized,response.data.actionSucceed);
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });
    }


    //Ajouter un artiste aux favoris
    // L'ajout d'un artiste aux favoris se fait côté serveur. Cette fonction est utilisée par différents controlleurs.
    function addFavoritesArt(name,cb) {
      $http({
        method: 'GET',
        url: API_ENDPOINT.url + '/action/addfavorite?type=artist&name='+name,
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
        cb(response.data.authorized,response.data.actionSucceed);
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });
    }

    //Supprimer un artist des favoris
    function delFavoritesArt(name,cb) {
      console.log('cet auteur '+name+' va être supprimée de vos favoris');
      $http({
        method: 'GET',
        url: API_ENDPOINT.url +'/action/removefavorite?type=artist&name='+name,
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
        cb(response.data.authorized,response.data.actionSucceed);
      }, function errorCallback(response) {
        console.log(response);
        console.log("error when connecting to server");
      });
    }

// Gestion des icones "star": remplie si l'artiste/Auteur/chanson appartient aux favoris de l'utilisateur, ou évidée si l'artiste/Auteur/Morceau ne fait pas partie de ses favoris
    var isLiked = function (iswc,userdata) {
      if (isAuthenticated){
        for (var l = 0; l < userdata.works.length; l++) {
          if (iswc == userdata.works[l].iswc) {
            return true;
          }
        }
      }
      return false;
    };

    var isLikedAuth = function (name,userdata) {
      if (isAuthenticated ){
        for (var k = 0; k < userdata.authors.length; k++) {
          if (name == userdata.authors[k].name) {
            return true;
          }
        }
      }
      return false;
    };

    var isLikedArt = function (name,userdata) {
      if (isAuthenticated ){
        for (var k=0;k<userdata.artists.length;k++){
          if (name == userdata.artists[k].name){
            return true;
          }
        }
      }
      return false;
    };

    //===================PLANNING=======================
    //This function must be called after each action add/remove!!!!
    function updatePlanning() {
      $http({
        method: 'GET',
        url: API_ENDPOINT.url + '/planning',
        header: {
          Origin: 'http://localhost:8100'
        }
      }).then(function successCallback(response) {
        if (response.data.authorized){
          userPlanning = [];
          userPlanning.push.apply(userPlanning,response.data.events);
          console.log("userPlanning updated : ")
          console.log(userPlanning);
        }
      });
    }

// Ajouter un évenement au planning
    var addPlanning = function (date, location, title, cdeprog, id_bit, callback) {
      if (isAuthenticated){
        if (cdeprog) {
          $http({
            method: 'GET',
            url: API_ENDPOINT.url + '/action/addevent?cdeprog=' + cdeprog + '&title=' + title + '&location=' + location + '&date=' + date,
            header: {
              Origin: 'http://localhost:8100'
            }
          }).then(function successCallback(response) {
            return (callback(response.data.authorized,response.data.actionSucceed));
          }, function errorCallback(response) {
            console.log("! failed to add this concert from your planning !");
          });
        }
        else {
          $http({
            method: 'GET',
            url: API_ENDPOINT.url + '/action/addevent?title=' + title + '&location=' + location + '&date=' + date +'&id_bit=' + id_bit,
            header: {
              Origin: 'http://localhost:8100'
            }
          }).then(function successCallback(response) {
            return (callback(response.data.authorized,response.data.actionSucceed));
          }, function errorCallback(response) {
            console.log("! failed to add this concert from your planning !");
          });
        }
      } else {
        callback(false,false);
      }
    };
//Supprimer un évenement du planning
    var delPlanning = function (cdeprog, idBit,callback) {
      if (isAuthenticated){
        console.log("delPlanning with cdeprog" + cdeprog);
        if(cdeprog){
          $http({
            method: 'GET',
            url: API_ENDPOINT.url + '/action/removeevent?cdeprog=' + cdeprog,
            header: {
              Origin: 'http://localhost:8100'
            }
          }).then(function successCallback(response) {
            callback(response.data.authorized,response.data.actionSucceed);
          }, function errorCallback(response) {
          });
        } else {
          $http({
            method: 'GET',
            url: API_ENDPOINT.url + '/action/removeevent?id_bit=' + idBit,
            header: {
              Origin: 'http://localhost:8100'
            }
          }).then(function successCallback(response) {
            callback (response.data.authorized,response.data.actionSucceed);
          }, function errorCallback(response) {
          });
        }
      } else {
        callback(false,false);
      }
    };

// Vérifier si un évenement appartient au planning
    var isInPlanning = function(cdeprog,idBit){
      if (!isAuthenticated){
        return false;
      }
      if (cdeprog && cdeprog !=="") {
        for (var i = 0; i < userPlanning.length; i++) {
          if (userPlanning[i]){
            if (userPlanning[i].cdeprog == cdeprog)
              return true;
          }
        }
      } else if (idBit && idBit !=="") {
        for (var i = 0; i < userPlanning.length; i++) {
          if (userPlanning[i].id_bit) {
            if (userPlanning[i].id_bit == idBit) return true;
          }
        }
      }
      return false;
    };

// Export des fonctions définies ci dessus pour leur utilisation dans les controlleurs des différentes pages de l'appli
    return {
      login: login,
      register: register,
      api: API_ENDPOINT.url,
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
      },
      getPlanning:function(){
        updatePlanning();
        return userPlanning;
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
