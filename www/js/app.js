// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter.controllers', []);

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.home', {
        url: '/home',
        views: {
          'tab-home': {
            templateUrl: 'templates/tab-home.html',
            controller: 'HomeCtrl'
          }
        }
      })

      .state('tab.search', {
        url: '/search',
        views: {
          'tab-search': {
            templateUrl: 'templates/tab-search.html',
            controller: 'SearchCtrl'
          }
        }
      })


      .state('tab.concertHome', {
        url: '/concert',
        views: {
          'tab-home': {
            templateUrl: 'templates/tab-concert.html',
            controller: 'ConcertCtrl'
          }
        }
      })
      .state('tab.concertSearch', {
        url: '/concert',
        views: {
          'tab-search': {
            templateUrl: 'templates/tab-concert.html',
            controller: 'ConcertCtrl'
          }
        }
      })


      .state('tab.auteur', {
        url: '/auteur/?name',
        views: {
          'tab-search': {
            templateUrl: 'templates/tab-auteur.html',
            params: {name: null},
            controller: 'AuteurCtrl'
          }
        }
      })


      .state('tab.artist', {
        url: '/artist/?name',
        views: {
          'tab-search': {
            templateUrl: 'templates/tab-artist.html',
            params: {name: null },
            controller: 'ArtistCtrl'
          }
        }
      })


      .state('tab.musique', {
        url: '/musique/?iswc&title',
        views: {
          'tab-search': {
            templateUrl: 'templates/tab-musique.html',
            params: {iswc: "",title :""},
            controller: 'MusiqueCtrl'
          }
        }
      })

      .state('tab.signin', {
        url: '/signin',
        views: {
          'tab-profil': {
            templateUrl: 'templates/tab-signin.html',
            controller: 'SigninCtrl'
          }
        }
      })


      .state('tab.signup', {
        url: '/signup',
        views: {
          'tab-profil': {
            templateUrl: 'templates/tab-signup.html',
            controller: 'SignupCtrl'
          }
        }
      })


      .state('tab.profil', {
        url: '/profil',
        views: {
          'tab-profil': {
            templateUrl: 'templates/tab-profil.html',
            controller: 'ProfilCtrl'
          }
        }
      })

      .state('tab.planning', {
        url: '/planning',
        views: {
          'tab-profil': {
            templateUrl: 'templates/tab-planning.html',
            controller: 'PlanningCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/home');

  });
