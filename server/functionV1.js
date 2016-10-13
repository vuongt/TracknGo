/**
 * Created by vuong on 13/10/2016.
 */

var request = require('request-promise'),
    async = require('async');

var config = require('../config-dev.js');

//======================API oeuvres===================
// Establish connection with API oeuvres
//====================================================
//Option to research by titles, authors, performers,...
var optionSacem = {
  method: 'GET',
  uri: config.sacem.uri,
  qs: {
    token: config.sacem.token,
    query: '', //search criteria
    //filters: '', // data on which the query applies : titles, subtitles, parties, performers. Those parameters can be added to each other
    pagesize: config.sacem.pagesize, //Number of works per page
    page: 1, //Number of page to return,
    blankfield: true
  },
  headers: {
    'Origin': config.sacem.headerOrigin
  }
};
//options to get details of a work
var optionSacemDetail = {
  method: 'GET',
  uri: config.sacem.uri_detail,
  qs: {
    token: config.sacem.token,
    iswc: '',
    blankfield: true
  },
  headers: {
    'Origin': config.sacem.headerOrigin
  }
};

//======================API Eliza===================
// Retrieve data from Eliza API
//===================================================
var optionEliza = {
  method: 'GET',
  uri: config.eliza.uri
};

//=======================API BandsInTown===============
//Option to connect to BandsInTown V2 API
//=====================================================
var artist = '';
var optionBIT = {
  method: 'GET',
  uri: 'http://api.bandsintown.com/artists/' + artist + '.json',
  qs: {
    api_version: '2.0',
    app_id: 'Sacem'
  }
};


/**
* Calculate distance between 2 point in Earth's surface
* @param lat1
* @param lon1
* @param lat2
* @param lon2
* @returns {number} Distance on Earth's surface
*/
function getDistance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d; //in km
}

/**
 * Convert deg to rad
 * @param deg
 * @returns {number}
 */
function deg2rad(deg) {
  return deg * (Math.PI/180)
}

/**
 * Searching for concerts in Eliza and calculate the distance to user's location
 * parameter position (lng and lat) are required
 * radius is 50 if not provided
 * date (start, end) is today if not provided
 * the server searching for concerts in Eliza,
 * then calculate the distance from concerts to user's position,
 *return the distance along with concert's information
 * @param req
 * @param res
 */
function searchConcerts(req, res) {
  res.setHeader('Content-Type', 'application/json');
  //params : lng, lat, radius, start, end
  var lng = "";
  var lat = "";
  var radius = "50"; //50km by default
  if (req.query.lng !== "" && req.query.lat !=="") {
    lng = req.query.lng;
    lat = req.query.lat;
  }
  if (req.query.radius !== "") {
    radius = req.query.radius;
  }
  if (req.query.start !== "" && req.query.end !== "") {
    var start = new Date(req.query.start);
    var end = new Date(req.query.end);
  } else {
    var today = new Date();
    start = today;
    end = today;
  }
  var results = {
    error: "",
    concerts: [],
    restrictedConcerts:[]
  };
  console.log(lng);
  console.log(lat);
  console.log("start day" + start);
  console.log("end day" + end);
  /*var dateList = [];
   var date = start;
   while (date <= end) {
   dateList.push(new String(date.toISOString()));
   date.setDate(date.getDate() + 1);
   }
   console.log(dateList);
   var calls = [];
   dateList.forEach(function (d) {
   calls.push(function (callback) {
   optionEliza.uri = config.eliza.uri + "/date/" + d;
   request(optionEliza, function (error, response, body) {
   if (error) {
   results.error = "Error when searching in Eliza";
   return callback(error);
   } else {
   results.concerts.push.apply(results.concerts, JSON.parse(body).slice());
   console.log("result for: " + d);
   console.log(results.concerts.length);
   callback(null, body);
   }
   });
   })
   });

   async.parallel(calls, function (err, result) {
   //This function is call when all the functions in calls have finished
   if (err) {
   return console.log(err);
   }*/
  optionEliza.uri = config.eliza.uri + "/dates/deb="+start.toISOString()+"&fin="+end.toISOString();
  request(optionEliza, function (error, response, body) {
    if (error) {
      results.error = "Error when searching in Eliza";
      res.send(JSON.stringify(results));
    } else {
      results.concerts = JSON.parse(body);
      console.log("got concerts from Eliza. Next : look for position");
      if (lng !== "" && lat !== "" && radius !== "") {
        var calls2 = [];
        results.concerts.forEach(function (c) {
          if (c.LAT !== "No result found" && c.LNG !== "No result found") {
            calls2.push(function () {
              var lngEliza = parseFloat(c.LNG);
              var latEliza = parseFloat(c.LAT);
              var lngUser = parseFloat(lng);
              var latUser = parseFloat(lat);
              var limit = parseFloat(radius);
              var distance = getDistance(latUser, lngUser,latEliza,lngEliza);
              if (distance < limit) {
                c.distance = distance;
                return results.restrictedConcerts.push(c);
              } else return 1;
            });
          }
        });
        console.log("done calls2. Starting async");
        async.parallel(calls2, function (err, result) {
          if (err) {
            console.log("error");
            return console.log(err);
          }
        });
        console.log("about to send");
        res.send(JSON.stringify(results));
        console.log("concerts sent");
      }
      else {
        res.send(JSON.stringify(results));
      }
    }
  });
}

/**
 * Search for works in API oeuvres with or without filters (page TRACK)
 * @param req
 * @param res
 */
function searchWorks(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  var results = {error: "", results: []};
  if (req.query.page) {
    optionSacem.qs.page = req.query.page;
  }
  optionSacem.qs.query = req.query.query;
  var filters = req.query.filters;
  if (filters !== "all") {
    optionSacem.qs.filters = req.query.filters;
    request(optionSacem, function (err, response, body) {
      if (err) {
        return console.log(err);
      } else {
        var bodyObj = JSON.parse(body);
        if (bodyObj.error == "") {
          for (var i = 0, length = bodyObj.works.length; i < length; i++) {
            var result = {};
            result.iswc = bodyObj.works[i].iswc;
            result.title = bodyObj.works[i].title;
            results.results.push(result);
          }
          res.send(JSON.stringify(results));
        } else if (bodyObj.error == "no work") { // If there is no work found, the response doesn't counted as error, so results.error =""
          res.send(JSON.stringify(results));
        }
        else {
          results.error = bodyObj.error;
          res.send(JSON.stringify(results));
        }
      }
    });
  }
  else {
    // all filters
    request(optionSacem, function (err, response, body) {
      if (err) {
        return console.log(err);
      } else {
        var bodyObj = JSON.parse(body);
        if (bodyObj.error == "") {
          for (var i = 0, length = bodyObj.works.length; i < length; i++) {
            var result = {};
            result.iswc = bodyObj.works[i].iswc;
            result.title = bodyObj.works[i].title;
            results.results.push(result);
          }
          res.send(JSON.stringify(results));
        } else if (bodyObj.error == "no work") { // If there is no work found, the response doesn't counted as error, so results.error =""
          res.send(JSON.stringify(results));
        }
        else {
          results.error = bodyObj.error;
          res.send(JSON.stringify(results));
        }
      }
    });
  }
}

/**
 * First, get artist's concerts from Bands In Town then get list of works from API oeuvres
 * @param req
 * @param res
 */
function getArtist(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  var detailsArtist = {
    error: "",
    artist: "",
    concerts: [],
    works: []
  };
  if (req.query.name && req.query.name !== "") {
    artist = req.query.name;
    detailsArtist.artist = artist;
    // Searching for concert of this artist from BandsInTown's API
    optionBIT.uri = 'http://api.bandsintown.com/artists/' + artist + '/events.json';
    optionSacem.qs.query = artist;
    optionSacem.qs.filters = "performers";
    //TODO better make 2 independent requests or with async
    request(optionBIT, function (errBit, resBit, bodyBit) {
      if (errBit) {
        detailsArtist.error = "Il y a un problème avec la connection internet. Veuillez réessayer plus tard";
        res.send(JSON.stringify(detailsArtist));
        return console.log(errBit);
      } else {
        var objectBit = JSON.parse(bodyBit);
        var lenBit = objectBit.length;
        for (var i = 0; i < lenBit; i++) {
          var concertBit = objectBit[i];
          var concert = {};
          concert.title = concertBit.title;
          concert.datetime = concertBit.datetime;
          concert.location = concertBit.formatted_location;
          concert.venue = concertBit.venue.place;
          concert.description = concertBit.description;
          concert.id_bit = concertBit.id;
          detailsArtist.concerts.push(concert);
        }
        // then get the artist's works list from API oeuvres SAcem
        request(optionSacem, function (errSacem, resSacem, bodySacem) {
          if (errSacem) {
            detailsArtist.error = "Il y a un problème avec la connection internet. Veuillez réessayer plus tard";
            res.send(JSON.stringify(detailsArtist));
            return console.log(errSacem);
          } else {
            var objectSacem = JSON.parse(bodySacem);
            if (objectSacem.error == "") {
              var lenSacem = objectSacem.works.length;
              for (var i = 0; i < lenSacem; i++) {
                var workSacem = objectSacem.works[i];
                var work = {};
                work.iswc = workSacem.iswc;
                work.title = workSacem.title;
                detailsArtist.works.push(work);
              }
              res.send(JSON.stringify(detailsArtist));
            } else if (objectSacem.error == "no work") {
              res.send(JSON.stringify(detailsArtist));
            } else {
              detailsArtist.error = objectSacem.error;
              res.send(JSON.stringify(detailsArtist));
            }
          }
        });
      }
    });
  } else {
    detailsArtist.error = "The name of artist is not defined";
    res.send(JSON.stringify(detailsArtist));
  }
}
//TODO error 404 of Band In Town when artist is unknown.
// The server doesn't crash but emit an error

/**
 * Show result from API oeuvres (list of this author's works)
 * @param req
 * @param res
 */
function getAuthor(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', config.accessControl);
  var author = {error: "", works: []};
  if (req.query.name && req.query.name !== "") {
    optionSacem.qs.query = req.query.name;
    if (req.query.page) optionSacem.qs.page = req.query.page;
    optionSacem.qs.filters = 'parties';
    request(optionSacem, function (err, response, body) {
      if (err) {
        author.error = "Error when retrieving data. Please try again later";
        res.send(JSON.stringify(author));
        return console.log(err);
      } else {
        var bodyObject = JSON.parse(body);
        if (bodyObject.error == "") {
          var length = bodyObject.works.length;
          for (var i = 0; i < length; i++) {
            var work = {};
            work.iswc = bodyObject.works[i].iswc;
            work.title = bodyObject.works[i].title;
            author.works.push(work);
          }
          res.send(JSON.stringify(author));
        } else if (bodyObject.error == "no work") {
          res.send(JSON.stringify(author));
        } else {
          author.error = bodyObject.error;
          res.send(JSON.stringify(author));
        }
      }
    });
  } else {
    author.error = "The name of the author is not defined";
    res.send(JSON.stringify(author));
  }

}

/**
 * Information from API oeuvre (artists, authors)
 * @param req
 * @param res
 */
function getWorkDetails(req, res) {
  //params :iswc
  res.setHeader('Content-Type', 'application/json');
  var work = {
    error: "",
    iswc: "",
    title: "",
    composerAuthor: [],
    performer: []
  };
  //Get information from API oeuvres and then Eliza
  if (req.query.iswc && req.query.iswc !== "") {
    optionSacemDetail.qs.iswc = req.query.iswc;
    request(optionSacemDetail, function (err, response, body) {
      if (err) {
        work.error = "Error when retrieving data. Please try again later";
        res.send(JSON.stringify(work));
        return console.log(err);
      } else {
        var bodyObj = JSON.parse(body);
        if (bodyObj.error == "") {
          work.title = bodyObj.title;
          work.iswc = bodyObj.iswc;
          var length = bodyObj['interested parties'].length;
          for (var i = 0; i < length; i++) {
            var party = bodyObj['interested parties'][i];
            if (party.role == "Composer/Author" || party.role == "Composer" || party.role == "Author") {
              if (work.composerAuthor) work.composerAuthor.push(party['first name'] + ' ' + party['last name']);
              else work.composerAuthor = [party['first name'] + ' ' + party['last name']];
            } else if (party.role == "Performer") {
              if (work.performer) work.performer.push(party['first name'] + ' ' + party['last name']);
              else work.performer = [party['first name'] + ' ' + party['last name']];
            }
          }
          res.send(JSON.stringify(work));
        } else {
          work.error = bodyObj.error;
          res.send(JSON.stringify(work));
        }
      }
    });
  } else {
    work.error = "Work's identifier undefined";
    res.send(JSON.stringify(work));
  }
}

/**
 * List of concerts having a song in its program (from Eliza)
 * @param req
 * @param res
 */
function getWorksConcerts(req, res) {
  //params :iswc
  res.setHeader('Content-Type', 'application/json');
  var work = {
    error: "",
    iswc: "",
    concerts: []
  };
  work.iswc = req.query.iswc;
  //Get information from Eliza
  if (req.query.iswc && req.query.iswc !== "") {
    var iswc_trimed = "T" + req.query.iswc.replace(new RegExp("[^(0-9)]", "g"), '');
    optionEliza.uri = config.eliza.uri + "/song/" + iswc_trimed;
    request(optionEliza, function (errEliza, resEliza, bodyEliza) {
      if (errEliza) {
        work.error = "Error when retrieving data. Please try again later";
        res.send(JSON.stringify(work));
        return console.log(errEliza);
      } else {
        var objEliza = JSON.parse(bodyEliza);
        var length = objEliza.length;
        work.concerts = objEliza;
        res.send(JSON.stringify(work));
      }
    });
  } else {
    work.error = "Work's identifier undefined";
    res.send(JSON.stringify(work));
  }
}

/**
 * Information about a concert from Eliza
 * @param req
 * @param res
 */
function getConcert(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var program = {
    error: "",
    cdeprog: "",
    setList: []
  };
  program.cdeprog = req.query.cdeprog;
  optionEliza.uri = config.eliza.uri + "/setList/" + program.cdeprog;
  request(optionEliza, function (errEliza, resEliza, bodyEliza) {
    if (errEliza) {
      program.error = "Error when retrieving data. Please try again later";
      res.send(JSON.stringify(program));
      return console.log(errEliza);
    } else {
      var objEliza = JSON.parse(bodyEliza);
      console.log(objEliza);
      if (objEliza.error) {
        program.error = objEliza.error;
        res.send(JSON.stringify(program));
      } else {
        var list = objEliza;
        var length = list.length;
        if (length) {
          for (var i = 0; i < length; i++) {
            var oeuvre = {};
            oeuvre.title = list[i].TITR;
            var iswcEliza = list[i].ISWC;
            if (iswcEliza.charAt(0) == "T" && iswcEliza.length == 11){
              oeuvre.iswc = iswcEliza.substring(0, 1) + "-" + iswcEliza.substring(1, 4) + "." + iswcEliza.substring(4, 7) + "." + iswcEliza.substring(7, 10) + "." + iswcEliza.substring(10);
            } else if (iswcEliza.length == 10){
              oeuvre.iswc = "T-" + iswcEliza.substring(0, 3) + "." + iswcEliza.substring(3, 6) + "." + iswcEliza.substring(6, 9) + "." + iswcEliza.substring(9);
            }
            else {
              oeuvre.iswc="";
            }
            program.setList.push(oeuvre);
          }
        }
        console.log("Program to sent: ");
        console.log(program);
        res.send(JSON.stringify(program));
      }
    }
  });
}

module.exports = {
  searchConcerts:searchConcerts,
  searchWorks:searchWorks,
  getArtist: getArtist,
  getAuthor:getAuthor,
  getWorkDetails:getWorkDetails,
  getWorksConcerts:getWorksConcerts,
  getConcert:getConcert
};
