var express = require('express'),
  session = require('express-session'),
  passport = require('passport'),
  bodyParser = require('body-parser');
  argv = require('minimist')(process.argv.slice(2)),
  swagger = require("swagger-node-express");

var app = express();
var subpath = express();
//config file contains all tokens and other private info
var config = require('./config-dev.js');

// handle all authentication operations
var authentication = require('./server/authentication.controller.js');

// handle all user relative operations (version 2)
var userAction = require('./server/user.controller.js');

//callback function for Version 1 services
var funct = require('./server/functionV1.js');

//====================EXPRESS=======================
// Express configuration
//==================================================
//app.use(logger('combined'));// TODO logging
app.use(bodyParser.urlencoded({extended: false})) /* Parser that only parses urlencoded body de type string*/
  .use(bodyParser.json());

app.use(passport.initialize())
  .use(passport.session());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", config.accessControl);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.end();
  } else {
    next();
  }
});
//for swagger
app.use("/v1", subpath);
swagger.setAppHandler(subpath);

app.use(express.static('dist'));

swagger.setApiInfo({
  title: "example API",
  description: "API to do something, manage something...",
  termsOfServiceUrl: "",
  contact: "yourname@something.com",
  license: "",
  licenseUrl: ""
});

swagger.setHeaders = function setHeaders(res) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-API-KEY");
};

subpath.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});
//=======================ROUTES========================
// Express routing
//=====================================================

//=================Track&Go 1.0=================
//==============================================

//---------------research concert---------------
// Searching for concerts in Eliza and calculate the distance to user's location
app.get('/search/concerts', funct.searchConcerts);

//----------------research work------------------
//Search for works in API oeuvres with or without filters (page TRACK)
app.get('/search/works', funct.searchWorks);

//---------------artist------------------/
//provide content for page artist
app.get('/artist', funct.getArtist);


//---------------author---------------
//Show result from API oeuvres (list of this author's works)
app.get('/author', funct.getAuthor);


//---------------work details---------------
//Information from API oeuvre (artists, authors)
app.get('/work', funct.getWorkDetails);

//List of concerts having this song in its program (from Eliza)
app.get('/work/program', funct.getWorksConcerts);
//----------------program details------------
//Information about a concert from Eliza
// param : code program
app.get('/program', funct.getConcert);

//=================Track&Go 2.0=================
//==============================================

//---------------Sign in, sign up, sign out---------------
//See function in details in authentication.controller.js
//sends the request through our local sign up strategy
//Token created with email
app.post('/signup', authentication.signup);
//sends the request through our local sign in strategy
app.post('/signin', authentication.signin);
//logs user out of site, deleting their token
app.get('/logout', authentication.signout);

//---------------profile---------------
// return user's information : name, list of favorite artists, authors and songs
//This information is stored in the database of application
// No parameter required. User's identity is extracted from request header.
app.get('/profile', userAction.profile);
//---------------planning---------------
//return planning of the user
// No parameter required.
// User's identity is extracted from request header.
app.get('/planning', userAction.planning );
//---------------action add event---------------
//add a concert to planning
app.get('/action/addevent', userAction.addEvent);

//---------------action remove event--------------
//remove a concert from planning
app.get('/action/removeevent', userAction.removeEvent );
//---------------action favorite---------------
//add work, author or artist to favorites
app.get('/action/addfavorite', userAction.addFavorite);
//remove work, author or artist from favorites
app.get('/action/removefavorite', userAction.removeFavorite);

//---------------comment---------------
//witring a comment to databases
app.post('/comment', userAction.postComment);
// get all comments of a concert from databases
app.get('/comment', userAction.getComment);


//===============Error handling====================
app.use(function (err, req, res) {
  console.log(err);
  res.status(500).send('Something broke!');
});



swagger.configureSwaggerPaths('', 'api-docs', '');

var domain = '149.202.167.34';
if(argv.domain !== undefined)
  domain = argv.domain;
else
  console.log('No --domain=xxx specified, taking default hostname "149.202.167.34".');
var applicationUrl = 'http://' + domain;
swagger.configure(applicationUrl, '1.0.0');


//=================PORT============================
//TODO verify if all connection has established before staring the server
var port = process.env.PORT || config.port; //select your port or let it pull from .env file //
app.listen(port, function (err) {
  if (err) {
    return console.log('Error listening to port' + port, err);
  }
  console.log("Server is listening on port " + port);
});
