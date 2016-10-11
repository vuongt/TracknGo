/**
 * Created by vuong on 22/09/2016.
 */
'use strict';
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcryptjs');
var token    = require('./token.controller.js');
var config = require('../config-dev');

/*Mariasql client to connect to the mariaDB*/
var mysql = require("mysql");
var mariaClient = new mysql.createPool({
  connectionLimit : 50,
  host: config.mariasql.host,
  user: config.mariasql.user,
  password: config.mariasql.password,
  database: config.mariasql.db
});

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

/**
 * Sign in operation : use passport local-signin strategy then if success, retrieve user information from req.user
 * Create a token from email, id and user name
 * Send the token
 * @param req
 * @param res
 * @param next
 */
function signin(req, res, next) {
  passport.authenticate('local-signin', function (err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.send({success: false, msg: info.msg});
    }
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
    })
  })(req, res, next);
}

/**
 * Sign out operation : expire the token in the request header
 * @param req
 * @param res
 */
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
/**
 * Sign up operation: use local-signup strategy and if succeed retrieve user info from req.user
 * Create a new token and send it to application
 * @param req
 * @param res
 * @param next
 */
function signup(req, res,next) {
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
}


/**
 * Middleware to verify the token and attaches the user object to the request if authenticated
 * @param req
 * @param res
 * @param next
 */
function isAuthenticated(req, res, next) {
  token.verifyToken(req.headers, function(next, err, data) {
    if (err) {
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
