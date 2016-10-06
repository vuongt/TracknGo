var express = require('express'),
// logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
// TOD0 session not necessary
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  request = require('request-promise'),
  bodyParser = require('body-parser'),
  token = require('./server/token.controller.js'),
  jwt = require('jsonwebtoken'),
  async = require('async'),
  bcrypt = require('bcryptjs');

var app = express();
var config = require('./config-dev.js'); //config file contains all tokens and other private info
var authentication = require('./server/authentication.controller.js');

//TODO verify if all connection has established before staring the server
//=======================MARIADB======================
/*Mariasql client to connect to the mariaDB*/
var mysql = require("mysql");
var mariaClient = new mysql.createPool({
  connectionLimit: 50,
  host: config.mariasql.host,
  user: config.mariasql.user,
  password: config.mariasql.password,
  database: config.mariasql.db
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
  mariaClient.getConnection(function (err, connection) {
    if (err) return done(err);
    else {
      connection.query("SELECT id, name, email FROM users WHERE id=?", [id], function (err, rows, fields) {
        return done(err, rows[0]);
      });
    }
    connection.release();
  })
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
    mariaClient.getConnection(function (err, connection) {
      if (err) return done(err);
      else {
        connection.query("SELECT * FROM users WHERE email=?", [email], function (err, rows, fields) {
          if (err) return done(err);
          if (!rows.length) {
            //If there is no user with that email
            // create the user
            var newUser = {};
            newUser.email = email;
            newUser.name = req.body.name;
            newUser.password = password;
            console.log('user password : '+newUser.password);
            bcrypt.genSalt(10, function (err, salt) {
              if (err) {
                return next(err);
              }
              bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                  return next(err);
                }
                newUser.password = hash;
                console.log("hash :" + newUser.password);
                var prep = 'INSERT INTO users (name,email,password) VALUES (?,?,?)';
                var insert = [newUser.name, newUser.email, newUser.password];
                var sql = mysql.format(prep, insert);
                mariaClient.getConnection(function (err, connection2) {
                  if (err) {
                    return done(err);
                  }
                  connection2.query(sql, function (err, rows, fields) {
                    if (err) {
                      return done(err);
                    }
                    console.log('row insert result: ');
                    console.dir(rows);
                    newUser.id = rows.insertId;
                    console.log("newUser object: ");
                    console.dir(newUser);
                    return done(null, newUser);
                  });
                  connection2.release();
                })
              });
            });
          } else {
            return done(null, false, {msg: 'This email has been registered'});
          }
        });
      }
      connection.release();
    })
  }
));

//---------------Sign in strategy----------------
passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function (req, email, password, done) {
    mariaClient.getConnection(function (err, connection) {
      if (err) {
        return done(err);
      } else {
        connection.query("SELECT * FROM users WHERE email=?", [email], function (err, rows) {
          if (err) return done(err);
          if (!rows.length) {
            return (done(null, false, {msg: 'No account is registered with this email !'}));
          }
          //if the user is found but the password is wrong
          bcrypt.compare(password, rows[0].password, function(err, isMatch) {
            if (!isMatch)
              return done(null, false, {msg: 'Wrong password'});
               // all is well, return successful user
            console.log("Login succeded");
            return done(null, rows[0]);
          });
        });
      }
      connection.release();
    })
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

app.post('/signup', function (req, res, next) {
  passport.authenticate('local-signup', function (err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.send({success: false, msg: info.msg});
    }
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    req.login(user, function (err) {
      if (err) {
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
app.post('/signin', function (req, res, next) {
  passport.authenticate('local-signin', function (err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.send({success: false, msg: info.msg});
    }
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    req.login(user, function (err) {
      if (err) {
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
app.get('/logout', authentication.signout);
/*function(req, res) {
 /*var name = req.user.name;
 console.log("LOG OUT " + req.user.name);
 req.logout();
 res.redirect('/home');
 req.session.notice = "You have successfully been logged out " + name + "!";
 });*/

//---------------research concert---------------
function getDistance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d; //in km
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

app.get('/search/concerts', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  //params : lng, lat, radius, start,end
  var lng = "";
  var lat = "";
  var radius = "50"; //50km by default
  if (req.query.lng !== "" && req.query.lat !=="") {
    lng = req.query.lng;
    lat = req.query.lat;
  }
  if (req.query.radius !== "") {
    radius = req.query.radius;
  }
  if (req.query.start !== "" && req.query.end !== "") {
    var start = new Date(req.query.start);
    var end = new Date(req.query.end);
  } else {
    var today = new Date();
    start = today;
    end = today;
  }
  var results = {
    error: "",
    concerts: [],
    restrictedConcerts:[]
  };
  console.log(lng);
  console.log(lat);
  console.log("start day" + start);
  console.log("end day" + end);
  /*var dateList = [];
  var date = start;
  while (date <= end) {
    dateList.push(new String(date.toISOString()));
    date.setDate(date.getDate() + 1);
  }
  console.log(dateList);
  var calls = [];
  dateList.forEach(function (d) {
    calls.push(function (callback) {
      optionEliza.uri = config.eliza.uri + "/date/" + d;
      request(optionEliza, function (error, response, body) {
        if (error) {
          results.error = "Error when searching in Eliza";
          return callback(error);
        } else {
          results.concerts.push.apply(results.concerts, JSON.parse(body).slice());
          console.log("result for: " + d);
          console.log(results.concerts.length);
          callback(null, body);
        }
      });
    })
  });

  async.parallel(calls, function (err, result) {
    //This function is call when all the functions in calls have finished
    if (err) {
      return console.log(err);
    }*/
  optionEliza.uri = config.eliza.uri + "/dates/deb="+start.toISOString()+"&fin="+end.toISOString();
  request(optionEliza, function (error, response, body) {
    if (error) {
      results.error = "Error when searching in Eliza";
      res.send(JSON.stringify(results));
    } else {
      results.concerts = JSON.parse(body);
      console.log("got concerts from Eliza. Next : look for position");
      if (lng !== "" && lat !== "" && radius !== "") {
        console.log("param query existent");
        var calls2 = [];
        results.concerts.forEach(function (c) {
          if (c.LAT !== "No result found" && c.LNG !== "No result found") {
            calls2.push(function () {
              var lngEliza = parseFloat(c.LNG);
              var latEliza = parseFloat(c.LAT);
              var lngUser = parseFloat(lng);
              var latUser = parseFloat(lat);
              var limit = parseFloat(radius);
              var distance = getDistance(latUser, lngUser,latEliza,lngEliza);
              if (distance < limit) {
                console.log("restricted contains " + results.restrictedConcerts.length);
                c.distance = distance;
                return results.restrictedConcerts.push(c);
              } else return 1;
            });
          }
        });
        console.log("done calls2. Starting async");
        async.parallel(calls2, function (err, result) {
          if (err) {
            console.log("error");
            return console.log(err);
          }
        });
        console.log("about to send");
        res.send(JSON.stringify(results));
        //console.log(results);
      }
      else {
        res.send(JSON.stringify(results));
      }
    }
  });
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
  var filters = req.query.filters;
  if (filters !== "all") {
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
          concert.datetime = concertBit.datetime;
          concert.location = concertBit.formatted_location;
          concert.venue = concertBit.venue.place;
          concert.description = concertBit.description;
          concert.id_bit = concertBit.id;
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
    concerts: []
  };
  work.iswc = req.query.iswc;
  //Get information from Eliza
  if (req.query.iswc && req.query.iswc !== "") {
    var iswc_trimed = "T" + req.query.iswc.replace(new RegExp("[^(0-9)]", "g"), '');
    optionEliza.uri = config.eliza.uri + "/song/" + iswc_trimed;
    request(optionEliza, function (errEliza, resEliza, bodyEliza) {
      if (errEliza) {
        work.error = "Error when retrieving data. Please try again later";
        res.send(JSON.stringify(work));
        return console.log(errEliza);
      } else {
        var objEliza = JSON.parse(bodyEliza);
        var length = objEliza.length;
        work.concerts = objEliza;
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
app.get('/program', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var program = {
    error: "",
    cdeprog: "",
    //title:"",
    //date:"",
    //location:"",
    setList: []
  };
  program.cdeprog = req.query.cdeprog;
  optionEliza.uri = config.eliza.uri + "/setList/" + program.cdeprog;
  request(optionEliza, function (errEliza, resEliza, bodyEliza) {
    if (errEliza) {
      program.error = "Error when retrieving data. Please try again later";
      res.send(JSON.stringify(program));
      return console.log(errEliza);
    } else {
      var objEliza = JSON.parse(bodyEliza);
      console.log(objEliza);
      if (objEliza.error) {
        program.error = objEliza.error;
        res.send(JSON.stringify(program));
      } else {
        //program.title = objEliza.TITRPROG;
        //program.date = objEliza.DATDBTDIF.replace(/T/, ' ').replace(/\..+/, '');
        //program.location = objEliza.ADR +objEliza.VILLE;
        var list = objEliza;
        var length = list.length;
        if (length) {
          for (var i = 0; i < length; i++) {
            var oeuvre = {};
            oeuvre.title = list[i].TITR;
            var iswcEliza = list[i].ISWC;
            if (iswcEliza.charAt(0) == "T" && iswcEliza.length == 11){
              oeuvre.iswc = iswcEliza.substring(0, 1) + "-" + iswcEliza.substring(1, 4) + "." + iswcEliza.substring(4, 7) + "." + iswcEliza.substring(7, 10) + "." + iswcEliza.substring(10);
            } else if (iswcEliza.length == 10){
              oeuvre.iswc = "T-" + iswcEliza.substring(0, 3) + "." + iswcEliza.substring(3, 6) + "." + iswcEliza.substring(6, 9) + "." + iswcEliza.substring(9);
            }
            else {
              oeuvre.iswc="";
            }
            program.setList.push(oeuvre);
          }
        }
        console.log("Program to sent: ");
        console.log(program);
        res.send(JSON.stringify(program));
      }
    }
  });
});


//---------------profile---------------
app.get('/profile', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  console.log('profile request');
  try {
    var requestToken = token.extractToken(req.headers);
  } catch (err) {
    return res.send({authorized: false});
  }
  if (requestToken) {
    try {
      var decoded = jwt.decode(requestToken, config.token.secret);
    } catch (err) {
      return res.send({authorized: false});
    }
    var user = {
      email: decoded.email,
      name: decoded.name,
      works: [],
      authors: [],
      artists: []
    };
    mariaClient.getConnection(function (err, connection) {
      if (err) {
        return done(err)
      } else {
        connection.query("SELECT * FROM favorite_works WHERE id_user=?", [decoded.id], function (err, rows, fields) {
          if (err) return console.log(err);
          else {
            for (var i = 0, length = rows.length; i < length; i++) {
              var work = {};
              work.iswc = rows[i].iswc;
              work.title = rows[i].title;
              user.works.push(work);
            }
            mariaClient.getConnection(function (err, connection2) {
              if (err) {
                return done(err);
              } else {
                connection2.query("SELECT * FROM favorite_authors WHERE id_user=?", [decoded.id], function (err, rows, fields) {
                  if (err) console.log(err);
                  else {
                    for (var i = 0, length = rows.length; i < length; i++) {
                      var author = {};
                      author.name = rows[i].name_author;
                      user.authors.push(author);
                    }
                    mariaClient.getConnection(function (err, connection3) {
                      if (err) {
                        return done(err);
                      } else {
                        connection3.query("SELECT * FROM favorite_artists WHERE id_user=?", [decoded.id], function (err, rows, fields) {
                          if (err) console.log(err);
                          else {
                            for (var i = 0, length = rows.length; i < length; i++) {
                              var artist = {};
                              artist.name = rows[i].name_artist;
                              user.artists.push(artist);
                            }
                            console.log("user object to send:");
                            console.log(user);
                            res.send(JSON.stringify(user));
                          }
                        });
                      }
                      connection3.release()
                    });
                  }
                })
              }
              connection2.release();
            });
          }
        });
      }
      connection.release();
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
    if (requestToken) {
      try {
        var decoded = jwt.decode(requestToken, config.token.secret);
        var userid = decoded.id;
      } catch (err) {
        return res.send({authorized: false});
      }
    }
    var planning = {authorized: true, events: []};
    mariaClient.getConnection(function (err, connection) {
      if (err) {
        console.log(error);
        return res.send({error: "error connecting to database"})
      } else {
        connection.query("SELECT * FROM planning WHERE id_user =?", [userid], function (err, rows, fields) {
          if (err) {
            console.log(err);
            return res.send({error: "reading database error"});
          }
          else {
            for (var i = 0, length = rows.length; i < length; i++) {
              var event = {};
              event.title = rows[i].title;
              event.prog_date = rows[i].prog_date;
              event.location = rows[i].location;
              event.cdeprog = rows[i].cdeprog;
              event.id = rows[i].id_event;
              event.id_bit = rows[i].id_bit;
              planning.events.push(event);
            }
            res.send(JSON.stringify(planning));
          }
        });
      }
      connection.release();
    });
  } catch (err) {
    return res.send({authorized: false});
  }

});

//---------------action add event---------------
app.get('/action/addevent', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var action = {authorized: false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
    if (requestToken) {
      var decoded = jwt.decode(requestToken, config.token.secret); //TODO decode or verify ?
      var userid = decoded.id;
      action.authorized = true;
      var cdeprog = "";
      console.log("location :" + req.query.location);
      if (req.query.cdeprog) {
        cdeprog = req.query.cdeprog;
      }
      var prep = "INSERT INTO planning (id_user, cdeprog, prog_date, location, title,id_bit) VALUES (?, ?, ?, ?, ?, ?);";
      var insert = [userid, cdeprog, req.query.date, req.query.location, req.query.title, req.query.id_bit];
      var sql = mysql.format(prep, insert);
      mariaClient.getConnection(function (err, connection) {
        if (err) {
          return res.json({error: "error connecting to database"})
        } else {
          connection.query(sql, function (err, rows, fields) {
            if (err) {
              return res.send(JSON.stringify(action));
            }
            action.actionSucceed = true;
            res.send(JSON.stringify(action));
          });
        }
        connection.release()
      });
    } else {
      res.send(JSON.stringify(action));
    }
  } catch (err) {
    console.log(err);
    res.send(JSON.stringify(action));
  }
});

//---------------action remove event--------------
app.get('/action/removeevent', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var action = {authorized: false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
    if (requestToken) {
      var decoded = jwt.decode(requestToken, config.token.secret); //TODO decode or verify ?
      var userid = decoded.id;
      action.authorized = true;
      if (req.query.cdeprog) {
        var prep = "DELETE FROM planning WHERE cdeprog = ?";
        var insert = [req.query.cdeprog];
        var sql = mysql.format(prep, insert);
        mariaClient.getConnection(function (err, connection) {
          if (err) {
            return res.json({error: "error connecting to database"});
          } else {
            connection.query(sql, function (err, rows, fields) {
              if (err) {
                return res.send(JSON.stringify(action));
              }
              action.actionSucceed = true;
              res.send(JSON.stringify(action));
            });
          }
          connection.release();
        });
      } else {
        var prep = "DELETE FROM planning WHERE id_bit = ?";
        var insert = [req.query.id_bit];
        var sql = mysql.format(prep, insert);
        mariaClient.getConnection(function (err, connection) {
          if (err) {
            res.json({error: "error connecting to database"})
          } else {
            connection.query(sql, function (err, rows, fields) {
              if (err) {
                return res.send(JSON.stringify(action));
              }
              action.actionSucceed = true;
              res.send(JSON.stringify(action));
            });
          }
          connection.release();
        });
      }

    } else {
      res.send(JSON.stringify(action));
    }
  } catch (err) {
    console.log(err);
    res.send(JSON.stringify(action));
  }
});

//---------------action favorite---------------
app.get('/action/addfavorite', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  //TODO revised try and catch blocks : make it more compact
  //params: type, id of the content, title
  var action = {authorized: false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers); //token has been verified here
    if (requestToken) {
      try {
        var decoded = jwt.decode(requestToken, config.token.secret);
        var userid = decoded.id;
      } catch (err) {
        console.log(err);//res.send (JSON.stringify(action));    }
      }
      action.authorized = true;
      if (req.query.type === "work") {
        var prepWork = "INSERT INTO favorite_works (id_user, iswc, title) VALUES (?,?,?);";
        var insert = [userid, req.query.iswc, req.query.title];
        var sql = mysql.format(prepWork, insert);
        mariaClient.getConnection(function (err, connection) {
          if (err) {
            res.json({error: "error connecting to database"})
          } else {
            connection.query(sql, function (err, rows, fields) {
              if (err) console.log(err); // return res.send(JSON.stringify(action));
              else {
                action.actionSucceed = true;
                console.log('Add favorite ' + req.query.title + ' succeeded');
                res.send(JSON.stringify(action));
              }
            });
          }
          connection.release();
        });
      }
      else if (req.query.type === "author") {
        var prepAuth = "INSERT INTO favorite_authors (id_user, name_author) VALUES (?,?)";
        var insertAuth = [userid, req.query.name];
        var sqlAuth = mysql.format(prepAuth, insertAuth);
        mariaClient.getConnection(function(err, connection) {
          if (err) {
            res.json({error: "error connecting to database"})
          } else {
          connection.query(sqlAuth, function (err, rows, fields) {
            if (err) res.send(JSON.stringify(action));
            else {
              action.actionSucceed = true;
              console.log('Add favorite ' + req.query.name + ' succeeded');
              res.send(JSON.stringify(action));
            }
          });
        }
          connection.release()
      });
      } else if (req.query.type === "artist") {
        var prepArt = "INSERT INTO favorite_artists (id_user, name_artist) VALUES (?,?)";
        var insertArt = [userid, req.query.name];
        var sqlArt = mysql.format(prepArt, insertArt);
        mariaClient.getConnection(function(err, connection) {
          if (err) {
            res.json({error: "error connecting to database"});
          } else {
          connection.query(sqlArt, function (err, rows, fields) {
            if (err) res.send(JSON.stringify(action));
            else {
              action.actionSucceed = true;
              console.log('Add favorite ' + req.query.name + ' succeeded');
              res.send(JSON.stringify(action));
            }
          });
        }
          connection.release();
      });
      }
    }
  } catch (err) {
    console.log(err);
    res.send(JSON.stringify(action));
  }
});
app.get('/action/removefavorite', function (req, res) {
  //params: type, id
  //TODO revised try and catch blocks : make it more compact
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);

  var action = {authorized: false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
    if (requestToken) {
      try {
        var decoded = jwt.decode(requestToken, config.token.secret);
        var userid = decoded.id;
      } catch (err) {
        res.send(JSON.stringify(action));
      }
    }
    action.authorized = true;
    if (req.query.type === "work") {
      var prepWork = "DELETE FROM favorite_works WHERE id_user=? AND iswc =?";
      var insertWork = [userid, req.query.iswc];
      var sqlWork = mysql.format(prepWork, insertWork);
      mariaClient.getConnection(function(err, connection){
        if (err) {
          res.json({error : "error connecting to database"});
        } else {
          connection.query(sqlWork, function (err, rows, fields) {
            if (err) return res.send(JSON.stringify(action));
            else {
              action.actionSucceed = true;
              console.log('Remove favorite ' + req.query.iswc + ' succeeded');
              res.send(JSON.stringify(action));
            }
          });
        }
        connection.release();
        });
    }
    if (req.query.type === "author") {
      var prepAuth = "DELETE FROM favorite_authors WHERE id_user=? AND name_author =?";
      var insertAuth = [userid, req.query.name];
      var sqlAuth = mysql.format(prepAuth, insertAuth);
      mariaClient.getConnection(function(err, connection) {
        if (err) {
          res.json({error: "error connecting to database"})
        } else {
        connection.query(sqlAuth, function (err, rows, fields) {
          if (err) res.send(JSON.stringify(action));
          else {
            action.actionSucceed = true;
            console.log('Remove favorite ' + req.query.name + ' succeeded');
            res.send(JSON.stringify(action));
          }
        });
      }
        connection.release();
    });
    }
    if (req.query.type === "artist") {
      var prepArt = "DELETE FROM favorite_artists WHERE id_user=? AND name_artist =?";
      var insertArt = [userid, req.query.name];
      var sqlArt = mysql.format(prepArt, insertArt);
      mariaClient.getConnection(function(err, connection) {
        if (err) {
          res.json({error: "error connecting to database"})
        } else {
        connection.query(sqlArt, function (err, rows, fields) {
          if (err) res.send(JSON.stringify(action));
          else {
            action.actionSucceed = true;
            console.log('Remove favorite ' + req.query.name + ' succeeded');
            res.send(JSON.stringify(action));
          }
        });
      }
        connection.release();
    });
    }
  } catch (err) {
    res.send(JSON.stringify(action));
  }
});

//---------------comment---------------
app.post('/comment', function (req, res) {
  //params: cdeprog, date, content
  res.setHeader('Content-Type', 'application/json');
  var action = {authorized: false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
    var decoded = jwt.decode(requestToken, config.token.secret);
    var userid = decoded.id;
    action.authorized = true;
    console.log('Before writing to DB : ');
    console.log(req.body);
    var prep = "INSERT INTO comment (cdeprog, id_user,creation_date,content) VALUES (?,?,?,?);";
    var insert = [req.body.cdeprog, userid, req.body.date, req.body.content];
    var sql = mysql.format(prep, insert);
    mariaClient.getConnection(function(err, connection) {
      if (err) {
        res.json({error: "error connecting to database"})
      } else {
        connection.query(sql, function (err, rows, fields) {
          if (err) {
            console.log(err);
            return res.send(JSON.stringify(action));
          } else {
            action.actionSucceed = true;
            console.log("posting comment succeeded");
            res.send(JSON.stringify(action));
          }
        });
      }
      connection.release();
    });
  } catch (err) {
    res.send(JSON.stringify(action));
  }

});
app.get('/comment', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var cdeprog = req.query.cdeprog;
  var comments = [];
  mariaClient.getConnection(function(err, connection) {
    if (err) {
      res.json({error: "error connecting to database"});
    } else {
      connection.query("SELECT * FROM comment INNER JOIN users ON comment.id_user = users.id where comment.cdeprog= ? ORDER BY creation_date DESC;", [cdeprog], function (err, rows) {
        if (err) {
          console.log(err);
          return res.send({error: "Error when reading from database"}); // TODO Error Handler
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
    }
  });
});

// TODO error handling
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send('Something broke!');
});

//=================PORT============================
var port = process.env.PORT || config.port; //select your port or let it pull from .env file //
app.listen(port, function (err) {
  if (err) {
    return console.log('Error listening to port' + port, err);
  }
  console.log("Server is listening on port " + port);
});
