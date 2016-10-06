module.exports = {
	port:"8080",
	secret:"FollowZBeat",
	mariasql:{
		"host":"149.202.167.34",
		"user":"dty",
		"password":"dty",
		"db":"appdb"
	},
	sacem:{
		token:"23d3cb8e-6852-4c3a-acb6-f964ce1e8109",
    uri:"https://sigried.sacem.fr/oeuvresrest/getworks",
    uri_detail:"https://sigried.sacem.fr/oeuvresrest/getworkdetails",
    headerOrigin:"http//dty.sacem.fr",
    pagesize:100
	},
  eliza:{
	  uri: "http://149.202.167.34:3000",
  },
	accessControl:"*",
  token: {
	  secret: "Track&Go",
    expiration:"24:00:00",
    expiration_string :"24h"
	}
}
