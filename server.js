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

//TODO verify if all connection has established before staring the server
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
 mariaClient.end();
 */
//TODO : end of each request ?
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
      console.log("rows object when checking email: ");console.log(rows[0]);
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
        return done(null, false, {msg: 'This email has been registered'});
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
        return (done(null, false, {msg: 'No user found'}));
      }
      //if the user is found but the password is wrong
      if (rows[0].password !== password)
        return done(null, false, {msg: 'Wrong password'});
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
    //filters: '', // data on which the query applies : titles, subtitles, parties, performers. Those parameters can be added to each other
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

//======================API Eliza===================
// Retrieve data from Eliza API
//===================================================
var optionEliza = {
  method: 'GET',
  uri: config.eliza.uri
};


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

//sends the request through our local signup strategy, and if successful takes user to homepage,
// otherwise returns then to signin page
//Token created with email
/*app.post("/signup", passport.authenticate('local-signup', {session: false}),
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
  });*/

app.post('/signup', function(req, res, next) {
  passport.authenticate('local-signup', function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (! user) {
      return res.send({ success : false, msg : info.msg});
    }
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    req.login(user, function(err){
      if(err){
        return next(err);
      }
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
  })(req, res, next);
});
//sends the request through our local signin strategy, and if successful takes user to homepage,
/*app.post('/signin', passport.authenticate('local-signin', {session: false}),
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
*/
app.post('/signin', function(req, res, next) {
  passport.authenticate('local-signin', function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (! user) {
      return res.send({ success : false, msg : info.msg});
    }
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    req.login(user, function(err){
      if(err){
        return next(err);
      }
      // If this function gets called, authentication was successful.
      // `req.user` contains the authenticated user.
      res.setHeader('Content-Type', 'application/json');
      token.createToken({email: req.user.email, id: req.user.id, name: req.user.name}, function (res, err, token) {
        if (err) {
          return res.status(400).send(err);
        }
        res.status(201).json({success: true, token: 'JWT ' + token});
        console.log('token sent');
      }.bind(null, res));
    });
  })(req, res, next);
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
  var filters= req.query.filters;
  if (filters !== "all"){
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
        } else if (bodyObj.error == "no work") { // If there is no work found, the response doesn't counted as error, so results.error =""
          res.send(JSON.stringify(results));
        }
        else {
          results.error = bodyObj.error;
          res.send(JSON.stringify(results));
        }
      }
    });
  }
  else {
    // all filters
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
        } else if (bodyObj.error == "no work") { // If there is no work found, the response doesn't counted as error, so results.error =""
          res.send(JSON.stringify(results));
        }
        else {
          results.error = bodyObj.error;
          res.send(JSON.stringify(results));
        }
      }
    });
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
    // Searching for concert of this artist from BandsInTown's API
    optionBIT.uri = 'http://api.bandsintown.com/artists/' + artist + '/events.json';
    optionSacem.qs.query = artist;
    optionSacem.qs.filters = "performers";
    //TODO artist not found from band in town
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
//Show result from API oeuvres or Eliza ? Rather API oeuvres
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
//Information fromAPI oeuvre and Eliza
//Song details from API Sacem
//List of concert from Eliza
app.get('/work', function (req, res) {
  //params :iswc
  res.setHeader('Content-Type', 'application/json');
  var work = {
    error: "",
    iswc: "",
    title: "",
    composerAuthor: [],
    performer: []
  };
  //Get information from API oeuvres and then Eliza
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

app.get('/work/program', function (req, res) {
  //params :iswc
  res.setHeader('Content-Type', 'application/json');
  var work = {
    error: "",
    iswc: "",
    concerts:[]
  };
  work.iswc = req.query.iswc;
  //Get information from Eliza
  if (req.query.iswc && req.query.iswc !== "") {
    var iswc_trimed = "T"+ req.query.iswc.replace(new RegExp("[^(0-9)]", "g"), '');
    optionEliza.uri = config.eliza.uri + "/song/" +iswc_trimed;
    request(optionEliza, function (errEliza,resEliza,bodyEliza){
      if (errEliza) {
        work.error = "Error when retrieving data. Please try again later";
        res.send(JSON.stringify(work));
        return console.log(errEliza);
      } else {
        var objEliza = JSON.parse(bodyEliza);
        var length= objEliza.length;
        if (length){
          for (var i =0; i< length;i++){
            var concert = {};
            var elizaConcert = objEliza[i];
            concert.title = elizaConcert.TITRPROG;
            concert.cdeprog= elizaConcert.CDEPROG;
            concert.date= elizaConcert.DATDBTDIF.replace(/T/, ' ').replace(/\..+/, '');
            concert.location= elizaConcert.ADR + elizaConcert.VILLE;
            work.concerts.push(concert);
          }
        }
        res.send(JSON.stringify(work));
      }
    });
  } else {
    work.error = "Work's identifier undefined";
    res.send(JSON.stringify(work));
  }
});

//----------------program details------------
//Information about a concert from Eliza
app.get('/program', function(req,res){
  res.setHeader('Content-Type','application/json');
  var program = {
    error:"",
    cdeprog:"",
    title:"",
    date:"",
    location:"",
    setList:[]
  };
  program.cdeprog = req.query.cdeprog;
  optionEliza.uri = config.eliza.uri + "/program/" +program.cdeprog;
  request(optionEliza, function (errEliza,resEliza,bodyEliza) {
    if (errEliza) {
      program.error = "Error when retrieving data. Please try again later";
      res.send(JSON.stringify(program));
      return console.log(errEliza);
    } else {
      var objEliza = JSON.parse(bodyEliza);
      program.title = objEliza.TITRPROG;
      program.date = objEliza.DATDBTDIF.replace(/T/, ' ').replace(/\..+/, '');
      program.location = objEliza.ADR ;
      var list = objEliza.SETLIST;
      var length = list.length;
      if (length) {
        for (var i = 0; i < length; i++) {
          var oeuvre = {};
          oeuvre.title = list[i].TITR;
          var iswcEliza = list[i].ISWC;
          oeuvre.iswc = iswcEliza.substring(0,1) + "-" + iswcEliza.substring(1,4) + "."+ iswcEliza.substring(4,7) + "."+ iswcEliza.substring(7,10) + "."+ iswcEliza.substring(10);
          program.setList.push(oeuvre);
        }
      }
      res.send(JSON.stringify(program));
    }
  });
});



//---------------profile---------------
app.get('/profile', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
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
          user.works.push(work);
        }
        mariaClient.query("SELECT * FROM favorite_authors WHERE id_user='" + decoded.id + "'", function (err, rows) {
          if (err) console.log(err);
          else {
            for (var i = 0, length = rows.length; i < length; i++) {
              var author = {};
              author.name = rows[i].name_author;
              user.authors.push(author);
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
      var userid = decoded.id;
    } catch (err) {
      return res.send({authorized: false});
    }
  }
  var planning ={authorized:true, events: []};
  mariaClient.query("SELECT * FROM planning WHERE id_user ='"+userid+"';", function(err,rows){
    if(err) {console.log(err); return res.send({error: "reading database error"});}
    else {
      for (var i = 0, length = rows.length; i < length; i++) {
        var event = {};
        event.title = rows[i].title;
        event.prog_date = rows[i].prog_date;
        event.location = rows[i].location;
        event.cdeprog = rows[i].cdeprog;
        event.id = rows[i].id_event;
        planning.events.push(event);
      }
      res.send(JSON.stringify(planning));
    }
  });

});

//---------------action add event---------------
app.get('/action/addevent',function(req,res){
  res.setHeader('Content-Type','application/json');
  var action ={authorized:false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
    if (requestToken){
      var decoded = jwt.decode(requestToken, config.token.secret); //TODO decode or verify ?
      var userid = decoded.id;
      action.authorized = true;
      var cdeprog = "";
      if (req.query.cdeprog) {cdeprog=req.query.cdeprog;}
      var prep = mariaClient.prepare("INSERT INTO planning (id_user, cdeprog, prog_date, location, title) VALUES (:userid, :cdeprog, :prog_date, :location, :title);");
      mariaClient.query(prep({userid:userid, cdeprog:cdeprog, prog_date:req.query.date, location:req.query.location, title:req.query.title}),function(err,rows){
        if (err){return res.send (JSON.stringify(action));}
        action.actionSucceed= true;
        res.send (JSON.stringify(action));
      });
    } else {
      res.send (JSON.stringify(action));
    }
  } catch (err) {
    console.log(err);
    res.send (JSON.stringify(action));
  }
});

//---------------action remove event--------------
app.get('/action/removeevent',function(req,res){
  res.setHeader('Content-Type','application/json');
  var action ={authorized:false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
    if (requestToken){
      var decoded = jwt.decode(requestToken, config.token.secret); //TODO decode or verify ?
      var userid = decoded.id;
      action.authorized = true;
      var prep = mariaClient.prepare("DELETE FROM planning WHERE id_event = :id");
      mariaClient.query(prep({id:req.query.id}),function(err,rows){
        if (err){return res.send (JSON.stringify(action));}
        action.actionSucceed= true;
        res.send (JSON.stringify(action));
      });
    } else {
      res.send (JSON.stringify(action));
    }
  } catch (err) {
    console.log(err);
    res.send (JSON.stringify(action));
  }
});

//---------------action favorite---------------
app.get('/action/addfavorite', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  //TODO revised try and catch blocks : make it more compact
  //params: type, id of the content, title
  var action ={authorized:false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
  } catch (err){
    console.log(err);//res.send (JSON.stringify(action));
  }
  if (requestToken) {
    try {
      var decoded = jwt.decode(requestToken, config.token.secret);
      var userid = decoded.id;
    } catch (err) {
      console.log(err);//res.send (JSON.stringify(action));    }
    }
    action.authorized = true;
    if (req.query.type === "work") {
      var prepWork = mariaClient.prepare("INSERT INTO favorite_works (id_user, iswc, title) VALUES (:userid,:iswc,:title);")
      mariaClient.query(prepWork({userid:userid,iswc:req.query.iswc,title:req.query.title}), function (err, rows) {
        if (err) console.log(err); // return res.send(JSON.stringify(action));
        else {
          action.actionSucceed = true;
          console.log('Add favorite ' + req.query.title + ' succeeded');
          res.send(JSON.stringify(action));
        }
      });
    }
    else if (req.query.type === "author") {
      var prepAuth = mariaClient.prepare("INSERT INTO favorite_authors (id_user, name_author) VALUES (:userid ,:name_author)");
      mariaClient.query(prepAuth({userid:userid, name_author:req.query.name}), function (err, rows) {
        if (err) res.send(JSON.stringify(action));
        else {
          action.actionSucceed = true;
          console.log('Add favorite ' + req.query.name + ' succeeded');
          res.send(JSON.stringify(action));
        }
      });
    }
  }
});
app.get('/action/removefavorite', function (req, res) {
  //params: type, id
  //TODO revised try and catch blocks : make it more compact
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);

  var action ={authorized:false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
  } catch (err){
    res.send (JSON.stringify(action));
  }
  if (requestToken) {
    try {
      var decoded = jwt.decode(requestToken, config.token.secret);
      var userid = decoded.id;
    } catch (err) {
      res.send (JSON.stringify(action));    }
  }
  action.authorized =true;
  if (req.query.type === "work") {
    var prepWork = mariaClient.prepare("DELETE FROM favorite_works WHERE id_user=:userid AND iswc =:iswc");
    mariaClient.query(prepWork({userid:userid,iswc:req.query.iswc}), function (err, rows) {
      if (err) return res.send (JSON.stringify(action));
      else {
        action.actionSucceed = true;
        console.log('Remove favorite ' + req.query.iswc+ ' succeeded');
        res.send (JSON.stringify(action));
      }
    });
  }
  if (req.query.type === "author") {
    var prepAuth = mariaClient.prepare("DELETE FROM favorite_authors WHERE id_user=:userid AND name_author =:name_author");
    mariaClient.query(prepAuth({userid:userid,name_author:req.query.name}), function (err, rows) {
      if (err) res.send (JSON.stringify(action));
      else {
        action.actionSucceed = true;
        console.log('Remove favorite ' + req.query.name + ' succeeded');
        res.send (JSON.stringify(action));
      }
    });
  }
});

//---------------comment---------------
app.post('/comment', function (req, res) {
  //params: cdeprog, date, content
  res.setHeader('Content-Type', 'application/json');
  var action ={authorized:false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
    var decoded = jwt.decode(requestToken, config.token.secret);
    var userid = decoded.id;
  } catch (err){
    res.send (JSON.stringify(action));
  }
  action.authorized =true;
  console.log ('Before writing to DB : ');
  console.log(req.body);
  var prep= mariaClient.prepare("INSERT INTO comment (cdeprog, id_user,creation_date,content) VALUES (:cdeprog,:userid,:date,:content);");
  mariaClient.query(prep({cdeprog:req.body.cdeprog,userid:userid,date:req.body.date, content:req.body.content}),function(err,rows){
    if (err) {
      console.log(err);
      return res.send({error:"Error when reading from database"}); // TODO Error Handler
    } else {
      action.actionSucceed =true;
      console.log("posting comment succeeded");
      res.send (JSON.stringify(action));
    }
  });
});
app.get('/comment', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
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
