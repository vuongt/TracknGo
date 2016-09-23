module.exports = {
	port:"8080",
	secret:"FollowZBeat",
	mariasql:{
		host:"localhost",
		user:"dty",
		password:"dty",
		db:"appdb"
	},
	sacem:{
		token:"23d3cb8e-6852-4c3a-acb6-f964ce1e8109",
    uri:"https://sigried.sacem.fr/oeuvresrest/getworks",
    uri_detail:"https://sigried.sacem.fr/oeuvresrest/getworkdetails",
    headerOrigin:"http//dty.sacem.fr",
    pagesize:50
	},
	accessControl:"http://localhost:8100",
  token: {
	  secret: "Track&Go",
    expiration:"00:03:00",
    expiration_string :"24h"
	}
}
