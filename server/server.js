var http = require("http");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var Client = require("mariasql");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var mariaClient = new Client({
	host:'localhost',
	user:'root',
	password:'digitalLab',
	db:'app'
});

app.use(bodyParser.json());
app.get("/", function(req, res){
	res.setHeader('Content-Type','text/html');
	res.send("<strong>Hello there</strong>");
})
.get("/auth",function(req,res){
	res.setHeader('Content-Type','text/html');
	res.render('authentification.ejs',{});
})
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
});

app.listen(8080,function(){
	console.log("Coucou");
});