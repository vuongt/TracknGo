// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter.controllers', []);

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
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

.config(function($stateProvider, $urlRouterProvider) {

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
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })


    .state('tab.concert', {
            url: '/concert',
            views: {
              'tab-concert': {
                templateUrl: 'templates/tab-concert.html',
                controller: 'ConcertCtrl'
              }
            }
          })


     .state('tab.auteur', {
                 url: '/auteur',
                 views: {
                   'tab-auteur': {
                     templateUrl: 'templates/tab-auteur.html',
                     controller: 'AuteurCtrl'
                   }
                 }
               })


     .state('tab.artist', {
                 url: '/artist',
                 views: {
                   'tab-artist': {
                     templateUrl: 'templates/tab-artist.html',
                     controller: 'ArtistCtrl'
                   }
                 }
               })


     .state('tab.musique', {
                 url: '/musique',
                 views: {
                   'tab-musique': {
                     templateUrl: 'templates/tab-musique.html',
                     controller: 'MusiqueCtrl'
                   }
                 }
               })

     .state('tab.signin', {
                       url: '/signin',
                       views: {
                         'tab-signin': {
                           templateUrl: 'templates/tab-signin.html',
                           controller: 'SigninCtrl'
                         }
                       }
                     })


      .state('tab.signup', {
                              url: '/signup',
                              views: {
                                'tab-signup': {
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
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});
