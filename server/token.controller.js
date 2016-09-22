/**
 * Created by vuong on 22/09/2016.
 */
var jwt = require('jsonwebtoken'),
  config= require('../config-dev.js');

/*Mariasql client to connect to the mariaDB*/
var Client = require("mariasql");
var mariaClient = new Client({
  host: config.mariasql.host,
  user: config.mariasql.user,
  password: config.mariasql.password,
  db: config.mariasql.db
});
/*

 */
//===================TOKEN CONTROLLER==============
//Token controller is responsible for creating,
// deleting and verifying token
//=================================================
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

function createToken(payload, cb) {
  var ttl = config.token.expiration;

  if(payload != null && typeof payload !== 'object') { return cb(new Error('payload is not an Object')) }
  if(ttl != null && typeof ttl !== 'number') { return cb(new Error('ttl is not a valid Number')) }

  var token = jwt.sign(payload, config.token.secret, { expiresIn: config.token.expiration_string });
  var string_expire = config.token.expiration;
  // stores a token with payload data for a ttl period of time
  var prep = mariaClient.prepare('INSERT INTO users_token (email,token,expire_date) VALUES (:email,:token,ADDTIME(NOW(),:expire_date))');
  mariaClient.query(prep({email:payload.email,token:token,expire_date:string_expire}),function(err,rows){
    if (err) { return cb(err); }
    if(rows) {
      cb(null, token);
    } else {
      cb(new Error('Token not set'));
    }
  });
}

//Expires a token
function expireToken(headers, cb) {
  try {
    var token = extractTokenFromHeader(headers);

    if(token == null) {return cb(new Error('Token is null'));}

    // delete token
    mariaClient.query("DELETE FROM users_token WHERE token = '"+token+"'",function(err,rows){
      if (err){ return cb(err);}
      if(!rows) {return cb(new Error('Token not found'));}

      return cb(null, true);
    });
  } catch (err) {
    return cb(err);
  }
}


//Verify if token is valid
function verifyToken(headers, cb) {
  try {
    var token = extractTokenFromHeader(headers);

    if(token == null) {return cb(new Error('Token is null'));}

    // gets the associated data of the token
    mariaClient.query("SELECT * FROM users_token WHERE token = '"+token+"'",function(err,rows){
      if (err){ return console.log(err);}
      else {
        if (!rows.length) {return cb(new Error('Token not found'));}
        else {
          return cb(null, JSON.parse(rows[0]));
          console.log('Token verified');
        }

      }
    });
    /*redis.get(token, function(err, userData) {
      if(err) {return cb(err);}

      if(!userData) {return cb(new Error('Token not found'));}

      return cb(null, JSON.parse(userData));
    });*/
  } catch (err) {
    return cb(err);
  }
}

module.exports = {
  createToken: createToken,
  expireToken: expireToken,
  verifyToken: verifyToken
};
