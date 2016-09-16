var express = require('express'),
	// logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
  request =require('request'),
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
/*Sign in/up strategy using passport.js*/
//=================================================
//Put user.id in session
passport.serializeUser(function(user, done) {
  console.log("serializing user id : " + user.id);
  return done(null, user.id);
});
//Retrieve user's information from session cookie.
passport.deserializeUser(function(id, done) {
  console.log("deserializing user with id: " + id);
  mariaClient.query("SELECT id, name FROM users WHERE id="+id,function(err,rows){
    return done(err,rows[0]);
  });
});

//--------Sign up strategy----------------
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
      console.log("rows object when checking email: " + rows);
      if (err) return done(err);
      if (!rows.length) {
        //If there is no user with that email
        // create the user
        var newUser = new Object();
        newUser.email = email;
        newUser.password = password;
        newUser.name= req.body.name;
        var prep = mariaClient.prepare('INSERT INTO users (name,email,password) VALUES (:name,:email,:password)');
        mariaClient.query(prep({name:req.body.name, email: email, password: password}), function (err, rows) {
          if (err) {return done(err);}
          console.log('row insert result: ')
          console.dir(rows);
          newUser.id = rows.info.insertId;
          console.log("newUser object: ");
          console.dir(newUser);
          return done(null, newUser);
        });
      } else {
        return done(null, false, { message: 'Email taken.' });
      }
    });
  }
));

//---------------Sign in strategy----------------
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
    console.log("Login succeded");
    return done (null, rows[0]);
  });
}
));
//====================EXPRESS=======================
// Express configuration
//==================================================
app.set('views', __dirname + '/server/views');
//app.use(logger('combined'));// TODO logging
app.use(cookieParser());
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
// Establish connection with API oeuvres
//====================================================
const optionOeuvres ={
  method:'GET',
  uri:config.oeuvre.uri,
  qs:{
    token:config.oeuvre.token,
    query:'song',
    filters:'titles',
    pagesize:20
  },
  headers:{
    'Origin':'http//dty.sacem.fr'
  }
};
request(optionOeuvres,function(err,res,body){
  if(err) {
    return console.log(err);
  } else {
    console.log(res.statusCode, body);
  }
});
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
};
request(optionListWorks).then(function(res){
	//Request succeed
}).catch(function(err){
	console.log(err);
	//TODO Handle Error
});*/

//=======================API BandsInTown===============
//Connect to BandsInTown V2 API
//=====================================================
/*var artist = 'Skrillex';
const option ={
 method:'GET',
 uri:'http://api.bandsintown.com/artists/'+ artist +'.json',
 qs:{
   api_version:2.0,
   app_id:'Sacem',
 }
};
request(option,function(err,res,body){
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
app.get("/home", function(req, res){
  res.setHeader('Content-Type','text/html');
  console.log('user in session: ');
  console.log(req.user);
  if(req.user){
    res.render('index.ejs',{name:req.user.name});
  }else{
    res.redirect("/signin");
  }
});

//---------------Sign in, log out---------------
app.get("/signin",function(req,res){
	res.setHeader('Content-Type','text/html');
	res.render('signin.ejs',{});
});

//sends the request through our local signup strategy, and if successful takes user to homepage,
// otherwise returns then to signin page
app.post("/local-reg", passport.authenticate('local-signup',{
  successRedirect: '/home',
  failureRedirect: '/signin'
  })
);
//sends the request through our local signin strategy, and if successful takes user to homepage,
// otherwise returns then to signin page
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/home',
    failureRedirect: '/signin'
  })
);

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
  var name = req.user.name;
  console.log("LOG OUT " + req.user.name)
  req.logout();
  res.redirect('/home');
  req.session.notice = "You have successfully been logged out " + name + "!";
});

//---------------research page---------------
app.get('/search', function(req,res){
  //params : position, rayon, start, end
});

//---------------profile---------------
app.get('/profile', function(req, res){
  res.setHeader('Content-Type','application/json');
  var user = {
    'name':req.user.name,
    'songs':['song1','song2'],
    'authors':['author1','author2']
  }
  res.send(JSON.stringify(user));
});

//---------------planning---------------
app.get('/planning', function(req, res){
  res.setHeader('Content-Type','text/plain');
});

//---------------action favorite---------------
app.get('/action/addfavorite',function(req,res){
  //params: type, id
  mariaClient.query("INSERT INTO TABLE")
  res.redirect('/home');
});
app.get('/action/removefavorite',function(req,res){
  //params: type, id
});

//---------------author---------------
app.get('/auteur',function(req,res){
  //params :id
});
//---------------song---------------
app.get('/song', function(req,res){
  //params :id
});
//---------------comment---------------
app.post('/comment',function(req,res){
  //params: date, comment
});

// TODO error handling
app.use(function(err,req,res,next){
	console.log(err);
	res.status(500).send('Something broke!');
});

mariaClient.end();
//=================PORT============================
var port = process.env.PORT || config.port ; //select your port or let it pull from .env file //
app.listen(port,function(err){
	if(err){
		return console.log('Error listening to port'+port, err);
	}
	console.log("Server is listening on port " + port);
});
