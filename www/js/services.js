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
          console.log('response');
          userInfo.name = response.data.name;
          userInfo.works = response.data.works;
          userInfo.authors = response.data.authors;
          console.log('get info of user : ' + userInfo.name)
          console.log(userInfo);
      });
    }

    var register = function(user) {
      return $q(function(resolve, reject) {
        $http.post(API_ENDPOINT.url + '/signup', user, {header: {Origin:"http://localhost:8100"}}).then(function(result) {
          if (result.data.success) {
            storeUserCredentials(result.data.token);
            storeUserInfo();
            console.log('info stored');
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

    // Charger les chansons préférées ici à parir de la BDD


    var favoris=["T-904.824.279.1", "T-904.795.074.3"];



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









    return {
      login: login,
      register: register,
      logout: logout,
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
