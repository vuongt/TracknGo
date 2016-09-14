var express = require('express'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	session = require('express-session'),
	RedisStore = require('connect-redis')(session),
	bodyParser = require("body-parser"),
	urlencodedParser = bodyParser.urlencoded({ extended: false }); /* Parser that only parses urlencoded body */

var app = express();
var config = require('./config-dev.js'); //config file contains all tokens and other private info

//===================PASSPORT======================
/*Authentification strategy using passport.js and Redis*/
/*Redis is an open source (BSD licensed), in-memory data structure store, 
used as database, cache and message broker. */

//====================EXPRESS=======================
app.use(session({ //Initiate a session
	secret: config.secret,
	resave:true,
	saveUninitialized:false
}))
.use(passport.initialize())
.use(passport.session());


//=======================MARIADB======================
/*Mariasql client to connect to the mariaDB*/
var Client = require("mariasql");
var mariaClient = new Client({
	host:config.host,
	user:config.user,
	password:config.password,
	db:config.db
});


//======================API oeuvres===================
var request = require('request-promise');
const optionListWorks ={
	method:'GET',
	uri:'http://sacem.fr/oeuvresrest/getworks',
	qs:{
		token:'123456',
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
});



//=======================ROUTES========================
app.get("/", function(req, res){
	res.setHeader('Content-Type','text/html');
	res.send("<strong>Hello there</strong>");
})
.get("/auth",function(req,res){
	res.setHeader('Content-Type','text/html');
	res.render('index.ejs',{});
}) 
/* Sign up simulation*/
.post("/auth/new", urlencodedParser, function(req,res){
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
})
.use(function(err,req,res,next){
	console.log(err);
	res.status(500).send('Something broke!');
}); // TODO error handling


//=================PORT============================
var port = process.env.PORT || config.port ; //select your port or let it pull from .env file //
app.listen(port,function(err){
	if(err){
		return console.log('Error listening to port'+port, err);
	}
	console.log("Server is listening on port " + port);
});
