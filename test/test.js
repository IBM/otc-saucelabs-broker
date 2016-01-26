/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


var request = require("supertest"),
	fs = require("fs"),
	VERSION;

request = request(process.env.TEST_URL);

try {
	VERSION = JSON.parse(fs.readFileSync("build_info.json", {encoding: "utf-8"}));
} catch (e) {
	throw "No build_info.json found: " + e;
}

request
	.get("/version")
	.set("Accept", "application/json")
	.expect("Content-Type", /json/)
	.expect(200, VERSION)
    .end(function(err, res){
    	if (err) {
    		throw err;
    	}
  	});

request
	.get("/status")
	.expect(200, {})
	.end(function(err, res){
    	if (err) {
    		throw err;
    	}
});
