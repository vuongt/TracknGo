var express = require('express'),
  // logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  // TOD0 session not necessary
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  request = require('request'),
  bodyParser = require('body-parser'),
  token = require('./server/token.controller.js'),
  jwt = require('jsonwebtoken');
var app = express();
var config = require('./config-dev.js'); //config file contains all tokens and other private info
var authentication = require('./server/authentication.controller.js');

//=======================MARIADB======================
/*Mariasql client to connect to the mariaDB*/
var Client = require("mariasql");
var mariaClient = new Client({
  host: config.mariasql.host,
  user: config.mariasql.user,
  password: config.mariasql.password,
  db: config.mariasql.db
});
/*
 app.post("/local-reg", function(req,res){
 const user = req.body;
 console.log(req.body);
 var prep = mariaClient.prepare('INSERT INTO users (name,email) VALUES (:name,:email)');
 if (user != {}){
 mariaClient.query(prep({name:user.name, email:user.email}),function(err, rows) {
 if (err)
 throw err;
 console.dir(rows);
 });
 }
 mariaClient.end();
 res.send("Inscription finished !");
 });
 */

//===================PASSPORT======================
/*Sign in/up strategy using passport.js*/
//=================================================

//Put user.id in session
passport.serializeUser(function (user, done) {
  console.log("serializing user id : " + user.id);
  return done(null, user.id);
});
//Retrieve user's information from session cookie.
passport.deserializeUser(function (id, done) {
  console.log("deserializing user with id: " + id);
  mariaClient.query("SELECT id, name, email FROM users WHERE id=" + id, function (err, rows) {
    return done(err, rows[0]);
  });
});

//--------Sign up strategy----------------
passport.use('local-signup', new LocalStrategy(
  {// by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true //allows us to pass back the entire request to the callback
  },
  function (req, email, password, done) {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to sign up already exists
    console.log('starting signup strategy' + req.body);
    mariaClient.query("SELECT * FROM users WHERE email='" + email + "'", function (err, rows) {
      console.log("rows object when checking email: " + rows);
      if (err) return done(err);
      if (!rows.length) {
        //If there is no user with that email
        // create the user
        var newUser = {};
        newUser.email = email;
        newUser.password = password;
        newUser.name = req.body.name;
        var prep = mariaClient.prepare('INSERT INTO users (name,email,password) VALUES (:name,:email,:password)');
        mariaClient.query(prep({name: req.body.name, email: email, password: password}), function (err, rows) {
          if (err) {
            return done(err);
          }
          console.log('row insert result: ');
          console.dir(rows);
          newUser.id = rows.info.insertId;
          console.log("newUser object: ");
          console.dir(newUser);
          return done(null, newUser);
        });
      } else {
        return done(null, false, {message: 'Email taken.'});
      }
    });
  }
));

//---------------Sign in strategy----------------
passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function (req, email, password, done) {
    mariaClient.query("SELECT * FROM users WHERE email='" + email + "'", function (err, rows) {
      if (err) return done(err);
      if (!rows.length) {
        return (done(null, false, {message: 'No user found'}));
      }
      //if the user is found but the password is wrong
      if (rows[0].password !== password)
        return done(null, false, {message: 'Wrong password'});
      // all is well, return successful user
      console.log("Login succeded");
      return done(null, rows[0]);
    });
  }
));
//====================EXPRESS=======================
// Express configuration
//==================================================
app.set('views', __dirname + '/server/views');
//app.use(logger('combined'));// TODO logging
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false})) /* Parser that only parses urlencoded body de type string*/
  .use(bodyParser.json());

app.use(session({ //Initiate a session
  secret: config.secret,
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use(function (req, res, next) {
  var err = req.session.error,
    msg = req.session.notice,
    success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

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
//======================API oeuvres===================
// Establish connection with API oeuvres
//====================================================
//Option to research by titles, authors, performers,...
var optionSacem = {
  method: 'GET',
  uri: config.sacem.uri,
  qs: {
    token: config.sacem.token,
    query: '', //search criteria
    filters: '', // data on which the query applies : titles, subtitles, parties, performers. Those parameters can be added to each other
    pagesize: config.sacem.pagesize, //Number of works per page
    page: 1, //Number of page to return,
    blankfield: true
  },
  headers: {
    'Origin': config.sacem.headerOrigin
  }
};
var optionSacemDetail = {
  method: 'GET',
  uri: config.sacem.uri_detail,
  qs: {
    token: config.sacem.token,
    iswc: '',
    blankfield: true
  },
  headers: {
    'Origin': config.sacem.headerOrigin
  }
};
/*
 request(optionListWorks).then(function(res){
 //Request succeed
 }).catch(function(err){
 console.log(err);
 //TODO Handle Error
 });*/

//=======================API BandsInTown===============
//Connect to BandsInTown V2 API
//=====================================================
var artist = '';
var optionBIT = {
  method: 'GET',
  uri: 'http://api.bandsintown.com/artists/' + artist + '.json',
  qs: {
    api_version: '2.0',
    app_id: 'Sacem'
  }
};
/*request(optionBIT,function(err,res,body){
 if(err) {
 return console.log(err);
 } else {
 console.log(res.statusCode, body);
 }
 });*/
//=======================ROUTES========================
// Express routing
//=====================================================
//---------------Home page-----------------------
app.get("/home", function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  console.log('user in session: ');
  console.log(req.user);
  if (req.user) {
    res.render('index.ejs', {name: req.user.name});
  } else {
    res.redirect("/signin");
  }
});

//---------------Sign in, log out---------------

//TODO disable session, delete redirect
app.get("/signin", function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.render('signin.ejs', {});
});

//sends the request through our local signup strategy, and if successful takes user to homepage,
// otherwise returns then to signin page
//Token created with email
app.post("/signup", passport.authenticate('local-signup', {session: false}),
  function (req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.setHeader('Content-Type', 'application/json');
    console.log('Authentication succeeded');
    token.createToken({email: req.user.email, id: req.user.id, name: req.user.name}, function (res, err, token) {
      if (err) {
        return res.status(400).send(err);
      }
      res.status(201).json({success: true, token: 'JWT ' + token});
      console.log('token sent');
    }.bind(null, res));
  });

//sends the request through our local signin strategy, and if successful takes user to homepage,
app.post('/signin', passport.authenticate('local-signin', {session: false}),
  function (req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    // Remove sensitive data before login
    res.setHeader('Content-Type', 'application/json');
    token.createToken({email: req.user.email, id: req.user.id, name: req.user.name}, function (res, err, token) {
      if (err) {
        return res.status(400).send(err);
      }
      res.status(201).json({success: true, token: 'JWT ' + token});
      console.log('token sent');
    }.bind(null, res));
  });

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/signout', authentication.signout);
/*function(req, res) {
 /*var name = req.user.name;
 console.log("LOG OUT " + req.user.name);
 req.logout();
 res.redirect('/home');
 req.session.notice = "You have successfully been logged out " + name + "!";
 });*/

//---------------research concert---------------
app.get('/search/concerts', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);

  //params : position, radius, start, end
});

//----------------research work------------------
//TODO l'espace dans le nom de la chanson
app.get('/search/works', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  var results = {error: "", results: []};
  if (req.query.page) {
    optionSacem.qs.page = req.query.page;
  }
  optionSacem.qs.query = req.query.query;
  if (req.query.filters && req.query.filters !== "") {
    optionSacem.qs.filters = req.query.filters;
    request(optionSacem, function (err, response, body) {
      if (err) {
        return console.log(err); //TODO send back error header
      } else {
        var bodyObj = JSON.parse(body);
        if (bodyObj.error == "") {
          for (var i = 0, length = bodyObj.works.length; i < length; i++) {
            var result = {};
            result.iswc = bodyObj.works[i].iswc;
            result.title = bodyObj.works[i].title;
            results.results.push(result);
          }
          res.send(JSON.stringify(results));
        } else if (bodyObj.error == "no work") {
          res.send(JSON.stringify(results));
        }
        else {
          results.error = bodyObj.error;
          res.send(JSON.stringify(results));
        }

      }
    });
  } else {
    results.error = "Please select a filter";
    res.send(JSON.stringify(results));
  }
});


//---------------artist------------------/
//Get artist information from Bands In Town
app.get('/artist', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  var detailsArtist = {
    error: "",
    artist: "",
    concerts: [],
    works: []
  };
  if (req.query.name && req.query.name !== "") {
    artist = req.query.name;
    detailsArtist.artist = artist;
    //TODO artist name with space
    // Searching for concert of this artist from BandsInTown's API
    optionBIT.uri = 'http://api.bandsintown.com/artists/' + artist + '/events.json';
    optionSacem.qs.query = artist;
    optionSacem.qs.filters = "performers";
    //TODO artist not found
    //TODO how to make 2 independent requests
    request(optionBIT, function (errBit, resBit, bodyBit) {
      if (errBit) {
        detailsArtist.error = "Il y a un problème avec la connection internet. Veuillez réessayer plus tard";
        res.send(JSON.stringify(detailsArtist));
        return console.log(errBit);
      } else {
        var objectBit = JSON.parse(bodyBit);
        var lenBit = objectBit.length;
        for (var i = 0; i < lenBit; i++) {
          var concertBit = objectBit[i];
          var concert = {};
          concert.title = concertBit.title;
          concert.datetime = concertBit.formatted_datetime;
          concert.location = concertBit.formatted_location;
          concert.venue = concertBit.venue.place;
          concert.description = concertBit.description;
          detailsArtist.concerts.push(concert);
        }
        request(optionSacem, function (errSacem, resSacem, bodySacem) {
          if (errSacem) {
            detailsArtist.error = "Il y a un problème avec la connection internet. Veuillez réessayer plus tard";
            res.send(JSON.stringify(detailsArtist));
            return console.log(errSacem);
          } else {
            var objectSacem = JSON.parse(bodySacem);
            if (objectSacem.error == "") {
              var lenSacem = objectSacem.works.length;
              for (var i = 0; i < lenSacem; i++) {
                var workSacem = objectSacem.works[i];
                var work = {};
                work.iswc = workSacem.iswc;
                work.title = workSacem.title;
                detailsArtist.works.push(work);
              }
              res.send(JSON.stringify(detailsArtist));
            } else if (objectSacem.error == "no work") {
              res.send(JSON.stringify(detailsArtist));
            } else {
              detailsArtist.error = objectSacem.error;
              res.send(JSON.stringify(detailsArtist));
            }
          }
        });
      }
    });
  } else {
    detailsArtist.error = "The name of artist is not defined";
    res.send(JSON.stringify(detailsArtist));
  }
});


//---------------author---------------
//TODO : show result from API oeuvres or Eliza ? Rather API oeuvres
app.get('/author', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  var author = {error: "", works: []};
  if (req.query.name && req.query.name !== "") {
    optionSacem.qs.query = req.query.name;
    if (req.query.page) optionSacem.qs.page = req.query.page;
    optionSacem.qs.filters = 'parties';
    request(optionSacem, function (err, response, body) {
      if (err) {
        author.error = "Error when retrieving data. Please try again later";
        res.send(JSON.stringify(author));
        return console.log(err);
      } else {
        var bodyObject = JSON.parse(body);
        if (bodyObject.error == "") {
          var length = bodyObject.works.length;
          for (var i = 0; i < length; i++) {
            var work = {};
            work.iswc = bodyObject.works[i].iswc;
            work.title = bodyObject.works[i].title;
            author.works.push(work);
          }
          res.send(JSON.stringify(author));
        } else if (bodyObject.error == "no work") {
          res.send(JSON.stringify(author));
        } else {
          author.error = bodyObject.error;
          res.send(JSON.stringify(author));
        }
      }
    });
  } else {
    author.error = "The name of the author is not defined";
    res.send(JSON.stringify(author));
  }

});


//---------------work details---------------
//Song details from API Sacem
app.get('/work', function (req, res) {
  //params :iswc
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  var work = {
    error: "",
    iswc: "",
    title: "",
    composerAuthor: [], // TODO is ipi code necessary ?
    performer: []/*,
     Concerts:[
     {
     title:"cnjdif",
     date:"bxuhezf",
     code:"cnjg",
     location:{"address":"cjsdf", "hall":"ncjdg"}
     },
     {
     title:"cnjdcerdif",
     date:"bxuhezf",
     code:"cnjg",
     location:{"address":"cjsdf", "hall":"ncjdg"}
     }
     ]*/
    //TODO retrieve information from Eliza
  };
  if (req.query.iswc && req.query.iswc !== "") {
    optionSacemDetail.qs.iswc = req.query.iswc;
    request(optionSacemDetail, function (err, response, body) {
      if (err) {
        work.error = "Error when retrieving data. Please try again later";
        res.send(JSON.stringify(work));
        return console.log(err);
      } else {
        var bodyObj = JSON.parse(body);
        if (bodyObj.error == "") {
          work.title = bodyObj.title;
          work.iswc = bodyObj.iswc;
          var length = bodyObj['interested parties'].length;
          for (var i = 0; i < length; i++) {
            var party = bodyObj['interested parties'][i];
            if (party.role == "Composer/Author" || party.role == "Composer" || party.role == "Author") {
              if (work.composerAuthor) work.composerAuthor.push(party['first name'] + ' ' + party['last name']);
              else work.composerAuthor = [party['first name'] + ' ' + party['last name']];
            } else if (party.role == "Performer") {
              if (work.performer) work.performer.push(party['first name'] + ' ' + party['last name']);
              else work.performer = [party['first name'] + ' ' + party['last name']];
            }
          }
          res.send(JSON.stringify(work));
        } else {
          work.error = bodyObj.error;
          res.send(JSON.stringify(work));
        }
      }
    });
  } else {
    work.error = "Work's identifier undefined";
    res.send(JSON.stringify(work));
  }
});


//---------------profile---------------
app.get('/profile', function (req, res) { //TODO get or post ?
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  // TODO verify token
  console.log(req.headers);
  try {
    var requestToken = token.extractToken(req.headers);
  } catch (err){
    return res.send({authorized : false});
  }
  if (requestToken){
    try {
      var decoded = jwt.decode(requestToken, config.token.secret);
    } catch (err) {
      return res.send({authorized: false});
    }
    var user = {
      'email': decoded.email,
      'name': decoded.name,
      'works': [],
      'authors': []
    };
    mariaClient.query("SELECT * FROM favorite_works WHERE id_user='" + decoded.id + "'", function (err, rows) {
      if (err) return console.log(err);
      else {
        for (var i = 0, length = rows.length; i < length; i++) {
          var work = {};
          work.iswc = rows[i].iswc;
          work.title = rows[i].title;
          user.works.push(work); //TODO Attention works may be empty outside this scope
        }
        mariaClient.query("SELECT * FROM favorite_authors WHERE id_user='" + decoded.id + "'", function (err, rows) {
          if (err) console.log(err);
          else {
            for (var i = 0, length = rows.length; i < length; i++) {
              var author = {};
              author.name = rows[i].name_author;
              user.authors.push(author); //TODO Attention works may be empty outside this scope
            }
            console.log("user object to send:");
            console.log(user);
            res.send(JSON.stringify(user));
          }
        });
      }
    });
  } else {
    res.send(JSON.stringify({authorized: false}));
  }
});

//---------------planning---------------
app.get('/planning', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  try {
    var requestToken = token.extractToken(req.headers);
  } catch (err){
    return res.send({authorized : false});
  }
  if (requestToken) {
    try {
      var decoded = jwt.decode(requestToken, config.token.secret);
    } catch (err) {
      return res.send({authorized: false});
    }
    var userid = decoded.id;
    var planning =[];
  }
  mariaClient.query("SELECT * FROM planning WHERE id_user ='"+userid+"';", function(err,rows){
    if(err) {console.log(err); return res.send({error: "reading database error"});}
    else {
      for (var i = 0, length = rows.length; i < length; i++) {
        var event = {};
        event.title = rows[i].title;
        event.prog_date = rows[i].date;
        event.location = rows[i].location;
        event.cdeprog = rows[i].cdeprog
        planning.push(event);
      }
      res.send(JSON.stringify(planning));
    }
  });

});

//---------------action favorite---------------
app.get('/action/addfavorite', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  //params: type, id of the content, title
  if (req.user) {
    if (req.query.type === "work") {
      mariaClient.query("INSERT INTO favorite_works (id_user, iswc, title) VALUES (" + req.user.id + "," + req.query.iswc + "," + req.query.title, function (err, rows) {
        if (err) return done(err);
        else {
          console.log('Add favorite ' + req.query.iswc + ' succeeded');
        }
      });
    } else if (req.query.type === "author") {
      mariaClient.query("INSERT INTO favorite_authors (id_user, name_author) VALUES (" + req.user.id + "," + req.query.name, function (err, rows) {
        if (err) return done(err);
        else {
          console.log('Add favorite ' + req.query.name + ' succeeded');
        }
      });
    } else {
      //TODO Error handling
    }
    //TODO no redirect after action
  } else res.redirect("/signin");

});
app.get('/action/removefavorite', function (req, res) {
  //params: type, id
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
});

//---------------comment---------------
app.post('/comment', function (req, res) {
  //params: date, content
  console.log("ok");
  res.send("ok")

});
app.get('/comment', function (req, res) {

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  var cdeprog = req.query.cdeprog;
  var comments = [];

  mariaClient.query("SELECT * FROM comment INNER JOIN users ON comment.id_user = users.id where comment.cdeprog='"+cdeprog+"';", function (err, rows) {
    if (err) {
      console.log(err);
      return res.send({error:"Error when reading from database"}) // TODO Error Handler
    }
    else {
      for (var i = 0, length = rows.length; i < length; i++) {
        var comment = {};
        comment.sender = rows[i].name;
        comment.date = rows[i].creation_date;
        comment.content = rows[i].content;
        comments.push(comment);
      }
    }
    res.send(JSON.stringify(comments));
  });
});

// TODO error handling
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send('Something broke!');
});

mariaClient.end();
//=================PORT============================
var port = process.env.PORT || config.port; //select your port or let it pull from .env file //
app.listen(port, function (err) {
  if (err) {
    return console.log('Error listening to port' + port, err);
  }
  console.log("Server is listening on port " + port);
});
