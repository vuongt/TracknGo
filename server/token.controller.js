/**
 * Created by vuong on 22/09/2016.
 */
var jwt = require('jsonwebtoken'),
  config = require('../config-dev.js');

/*Mariasql client to connect to the mariaDB*/
var mysql = require("mysql");
var mariaClient = mysql.createPool({
  connectionLimit : 50,
  host: config.mariasql.host,
  user: config.mariasql.user,
  password: config.mariasql.password,
  database: config.mariasql.db
});

//===================TOKEN CONTROLLER==============
//Token controller is responsible for creating,
// deleting and verifying token
//=================================================
/**
 * Extract token from header
 * @param headers
 * @returns {*}
 */
function extractTokenFromHeader(headers) {
  if (headers == null) throw new Error('Header is null');
  if (headers.authorization == null) throw new Error('Authorization header is null');

  var authorization = headers.authorization;
  var authArr = authorization.split(' ');
  if (authArr.length !== 2) throw new Error('Authorization header value is not of length 2');

  var token = authArr[1];

  try {
    jwt.verify(token, config.token.secret);
  } catch(err) {
    throw new Error('The token is not valid');
  }
  return token;
}

/**
 * Create a token from payload
 * @param payload
 * @param cb callback function
 * @returns {*}
 */
function createToken(payload, cb) {
  var expire = config.token.expiration;
  console.log('creating token...');
  console.log(payload);
  if(payload != null && typeof payload !== 'object') { return cb(new Error('payload is not an Object')) }
  var token = jwt.sign(payload, config.token.secret, { expiresIn: config.token.expiration_string });
  // stores a token with payload data for a ttl period of time
  console.log('token created');
  var prep ='INSERT INTO users_token (email,token,expire_date) VALUES (?,?,ADDTIME(NOW(),?))';
  var insert = [payload.email, token, expire];
  var sql = mysql.format(prep, insert);
  mariaClient.getConnection(function(err, connection) {
    if (err) {
      return cb(err);
    } else {
    connection.query(sql, function (err, rows, fields) {
      if (err) {
        return cb(err);
      }
      if (rows) {
        cb(null, token);
      } else {
        cb(new Error('Token not set'));
      }
    });
  }
    connection.release();
});
}

/**
 * Expire a token : Delete it from database
 * @param headers
 * @param cb function callback
 * @returns {*}
 */
function expireToken(headers, cb) {
  try {
    var token = extractTokenFromHeader(headers);

    if(token == null) {return cb(new Error('Token is null'));}

    // delete token
    mariaClient.getConnection(function(err, connection) {
      if (err) {
        return cb(err);
      } else {
        connection.query("DELETE FROM users_token WHERE token = ?", [token], function (err, rows, fields) {
          if (err) {
            return cb(err);
          }
          if (!rows) {
            return cb(new Error('Token not found'));
          }
          return cb(null, true);
        });
      }
      connection.release();
    });
  } catch (err) {
    return cb(err);
  }
}

/**
 * Verify if token is valid : Extract from header then check
 * @param headers header of the request
 * @param cb callback function
 * @returns {*}
 */
function verifyToken(headers, cb) {
  try {
    var token = extractTokenFromHeader(headers);

    if(token == null) {return cb(new Error('Token is null'));}

    // gets the associated data of the token
    mariaClient.getConnection(function(err, connection) {
      if (err) {
        return cb(err);
      } else {
        connection.query("SELECT * FROM users_token WHERE token = ?", [token], function (err, rows, fields) {
          if (err) {
            return console.log(err);
          }
          else {
            if (!rows.length) {
              return cb(new Error('Token not found'));
            }
            else {
              return cb(null, JSON.parse(rows[0]));
              console.log('Token verified');
            }

          }
        });
      }
      connection.release()
    });
  } catch (err) {
    return cb(err);
  }
}

module.exports = {
  createToken: createToken,
  expireToken: expireToken,
  verifyToken: verifyToken,
  extractToken: extractTokenFromHeader
};
