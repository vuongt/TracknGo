/**
 * Created by vuong on 22/09/2016.
 */
'use strict';
var passport = require('passport');
var token    = require('./token.controller.js');
var config = require('../config-dev');

/*Mariasql client to connect to the mariaDB*/
var Client = require("mariasql");
var mariaClient = new Client({
  host: config.mariasql.host,
  user: config.mariasql.user,
  password: config.mariasql.password,
  db: config.mariasql.db
});

function signin(req, res, next) {
  passport.authenticate('local-signin', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(401).send(error);

    // Remove sensitive data before login
    user.password = undefined;

    token.createToken(user, function(res, err, token) {
      if(err) {
        return res.status(400).send(err);
      }
      res.status(201).json({token: token});
    }.bind(null, res));
  })(req, res, next)
}

function signout(req, res) {
  token.expireToken(req.headers, function(err, success) {
    if (err) {
      return res.status(401).send(err.message);
    }
    if(success) {
      delete req.user;
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  });
}

function signup(req, res) {
  var email = req.body.email || '';
  var password = req.body.password || '';

  if (email == '' || password == '') {
    return res.sendStatus(400);
  }
  mariaClient.query("SELECT * FROM users WHERE email='"+req.body.email+"'" ,function(err,rows){
    console.log("rows object when checking email: " + rows);
    if (err) return done(err);
    if (!rows.length) {
      //If there is no user with that email
      // create the user
      var newUser = {};
      newUser.email = req.body.email;
      newUser.password = req.body.password;
      newUser.name= req.body.name;
      var prep = mariaClient.prepare('INSERT INTO users (name,email,password) VALUES (:name,:email,:password)');
      mariaClient.query(prep({name:req.body.name, email: newUser.email, password: newUser.password}), function (err, rows) {
        if (err) {return done(err);}
        console.log('row insert result: ');
        console.dir(rows);
        newUser.id = rows.info.insertId;
        console.log("newUser object: ");
        console.dir(newUser);
        // Remove sensitive data before login
        newUser.password = undefined;
        newUser.name = undefined;

        token.createToken(newUser, function(res, err, token) {
          if (err) {
            logger.error(err.message);
            return res.status(400).send(err);
          }
          res.status(201).json({token: token});
        }.bind(null, res));
      });
    } else {
      return done(null, false, { message: 'Email taken.' });
    }
  });
}
//Middleware to verify the token and attaches the user object to the request if authenticated
function isAuthenticated(req, res, next) {
  token.verifyToken(req.headers, function(next, err, data) {
    if (err) {
      logger.error(err.message);
      return res.status(401).send(err.message);
    }
    req.user = data;
    next();
  }.bind(null, next));
}

module.exports = {
  signin: signin,
  signout: signout,
  signup: signup,
  isAuthenticated: isAuthenticated
};
