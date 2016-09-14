var express = require('express'),
	// logger = require('morgan'),
	// cookieParser = require('cookie-parser'),
	session = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	// RedisStore = require('connect-redis')(session),
	bodyParser = require('body-parser'),
	config = require('./config.js'), //config file contains all tokens and other private info
  funct = require('./server/function.js'); // funct file contains helper functions for Passport and database work

var app = express();

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
/*Sign in/up strategy using passport.js and Redis*/
/*Redis is an open source (BSD licensed), in-memory data structure store,
used as database, cache and message broker. */
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.email);
  return done(null, user);
});
passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  return done(null, obj);
});

//sign up strategy
passport.use('local-signup', new LocalStrategy(
  {// by default, local strategy uses username and password, we will override with email
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true //allows us to pass back the entire request to the callback
  },
  function(req,email,password,done){
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to sign up already exists
    mariaClient.query("SELECT * FROM users WHERE email='"+email+"'" ,function(err,rows){
      console.log("rows object: " + rows);
      if (err) return done(err);
      if (!rows.length) {
        //If there is no user with that email
        // create the user
        var newUser = new Object();
        newUser.email = email;
        newUser.password = password;
        //newUser.name = req.body.name;
        var prep = mariaClient.prepare('INSERT INTO users (email,password) VALUES (:email,:password)');
        mariaClient.query(prep({email: email, password: password}), function (err, rows) {
          if (err) {return done(err);}
          return done(null, newUser);
        });
      } else {
        return done(null, false, { message: 'Email taken.' });
      }
    });
  }
));

//Sign in strategy
passport.use('local-login', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback:true
},
function (req, email, password, done){
  mariaClient.query("SELECT * FROM users WHERE email='"+email+"'",function(err,rows){
    if (err) return done(err);
    if (!rows.length){
      return (done(null, false, {message:'No user found'}));
    }
    //if the user is found but the password is wrong
    if (rows[0].password !== password)
      return done(null, false, {message:'Wrong password'});
    // all is well, return successful user
    return done (null, rows[0]);
  });
}
));
//====================EXPRESS=======================
app.set('views', __dirname + '/server/views');

//app.use(logger('combined'));// TODO logging
// app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false })) /* Parser that only parses urlencoded body de type string*/
.use(bodyParser.json());

app.use(session({ //Initiate a session
	secret: config.secret,
	resave:true,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use(function(req, res, next){
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


//======================API oeuvres===================
/*var request = require('request-promise');
const optionListWorks ={
	method:'GET',
	uri:config.oeuvre.uri,
	qs:{
		token:config.oeuvre.token,
		query:'',
		filters:'',
		cc:'',
		pagesize:'',
		page:'',
		blankfield:''
	},
	json:true
}
request(optionListWorks).then(function(res){
	//Request succed
}).catch(function(err){
	console.log(err);
	//TODO Handle Error
});*/



//=======================ROUTES========================
//Home page
app.get("/", function(req, res){
	res.setHeader('Content-Type','text/html');
	res.send("<strong>Hello there</strong> <a href='/signin'>Go to sign up page</a>");
});

//Sign in page
app.get("/signin",function(req,res){
	res.setHeader('Content-Type','text/html');
	res.render('index.ejs',{});
});

//sends the request through our local signup strategy, and if successful takes user to homepage,
// otherwise returns then to signin page
app.post("/local-reg", passport.authenticate('local-signup',{
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);
//sends the request through our local signin strategy, and if successful takes user to homepage,
// otherwise returns then to signin page
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/signin'
  })
);

//logs user out of site, deleting them from the session, and returns to homepage
/*app.get('/logout', function(req, res){
  var name = req.user.username;
  console.log("LOGGIN OUT " + req.user.username)
  req.logout();
  res.redirect('/');
  req.session.notice = "You have successfully been logged out " + name + "!";
});
*/

// TODO error handling
app.use(function(err,req,res,next){
	console.log(err);
	res.status(500).send('Something broke!');
});

//=================PORT============================
var port = process.env.PORT || config.port ; //select your port or let it pull from .env file //
app.listen(port,function(err){
	if(err){
		return console.log('Error listening to port'+port, err);
	}
	console.log("Server is listening on port " + port);
});
