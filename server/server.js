var http = require("http");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.get("/", function(req, res){
	res.setHeader('Content-Type','text/html');
	res.send("<p>Hello there</p>");
	
});

app.listen(8080,function(){
	console.log("Coucou");
});