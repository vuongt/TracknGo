/**
 * Created by vuong on 11/10/2016.
 */

//==================================================
//          USER RELATIVE ACTION - V2
//==================================================
/*
 IMPORTANT : In every request which concerns authentication, the server will try to verify
 and extract user's identity from header (json web token) and return 2 booleans: authorised and actionSucceed (if the request is an action)
 authorised = false if there is no token or the token isn't valid
 actionSucceed = false if there is a problem performing action
 */

var config = require('../config-dev.js'),//config file contains all tokens and other private info
  token = require('./token.controller.js'),
  jwt = require('jsonwebtoken');
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

/**
 * return user's information : name, list of favorite artists, authors and songs
 * This information is stored in the database of application
 * No parameter required. User's identity is extracted from request header.
 * @param req
 * @param res
 * @returns {*}
 */
function profile(req,res){
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
}

/**
 * Return planning of user
 * No parameter required. User's identity is extracted from request header.
 * @param req
 * @param res
 * @returns {*}
 */
function planning(req, res) {
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

}

/**
 * Add a concert to planning
 * @param req
 * @param res
 */
function addEvent(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var action = {authorized: false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
    if (requestToken) {
      var decoded = jwt.decode(requestToken, config.token.secret);
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
}

/**
 * remove a concert from planning
 * @param req
 * @param res
 */
function removeEvent(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var action = {authorized: false, actionSucceed: false};
  try {
    var requestToken = token.extractToken(req.headers);
    if (requestToken) {
      var decoded = jwt.decode(requestToken, config.token.secret);
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
}

/**
 * add work, author or artist to favorites
 * @param req
 * @param res
 */
function addFavorite(req, res) {
  res.setHeader('Content-Type', 'application/json');
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
}

/**
 * remove work, author or artist from favorites
 * @param req
 * @param res
 */
function removeFavorite(req, res) {
  //params: type, id
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
}
/**
 * witring a comment to databases
 * @param req
 * @param res
 */
function postComment(req, res) {
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

}

/**
 * get all comments of a concert from databases
 * @param req
 * @param res
 */
function getComment(req, res) {
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
          return res.send({error: "Error when reading from database"});
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
}


module.exports = {
  profile:profile,
  planning:planning,
  addEvent:addEvent,
  removeEvent:removeEvent,
  addFavorite:addFavorite,
  removeFavorite:removeFavorite,
  postComment:postComment,
  getComment:getComment
};
