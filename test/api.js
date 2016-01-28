/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


var request = require("supertest"),
	config = require("../util/config"),
	request2 = require("superagent");

request = request(process.env.TEST_URL);


var sid = "TEST",
	baseUrl = config.contextRoot + config.contextPath + "/service_instances/" + sid,
	create = {
		"dashboard_url": "http://sourcelab.override.config.com",
		"parameters": {"username":"", "key":""}
	},
	expectedReply = {
		"dashboard_url": "http://sourcelab.override.config.com",
		"parameters": {"username":"", "key":""}
	},
	auth = "Bearer ";

create.parameters.username = process.env.SAUCELABS_USERNAME;
create.parameters.key = process.env.SAUCELABS_KEY;
create.organization_guid = process.env.ORGANIZATION_GUID;

expectedReply.instance_id = sid;
expectedReply.parameters.username = process.env.SAUCELABS_USERNAME;
expectedReply.parameters.key = process.env.SAUCELABS_KEY;
expectedReply.parameters.label = expectedReply.parameters.username;

console.log("Tests started");

validateEnv();

function validateEnv(){

	var env = ["TEST_URL", "SAUCELABS_USERNAME","SAUCELABS_KEY","ORGANIZATION_GUID","SAUCELABS_USERNAME","SAUCELABS_KEY","TEST_USER","TEST_PASSWORD","TOKEN_HOST"];
	for(var i = 0; i < env.length;i++){
		if (typeof process.env[env[i]] === "undefined"){
			throw "Missing env var " + env[i];
		}
	}
	fetchToken(function(token){
		auth += token;
		testPUTCreate();
	});
}





function fetchToken(cb) {
    var formData = {
        "grant_type": "password"
    };

    formData.username = process.env.TEST_USER;
    formData.password = process.env.TEST_PASSWORD;

    request2
        .post(process.env.TOKEN_HOST + "/UAALoginServerWAR/oauth/token")
        .type("form")
    	.set("Authorization", "Basic Y2Y6")
    	.set("Accept", "application/json")
    	.send(formData)
        .end(function (err, res) {
            if (err){
                throw err;
            } else if (!("access_token" in res.body)) {
            	throw "No access token found";
            } else {
            	cb(res.body.access_token);
            }
        });
}
/*
 * Test ../:sid route (PUT/PATCH)
 */
function testPUTCreate(){
	request
		.put(baseUrl)
		.set("Authorization", auth)
		.set("Accept", "application/json")
		.send(create)
		.expect("Content-Type", /json/)
		.expect(200, expectedReply)
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Put (create) OK");
				testPUTUpdate();
			}
		});
}

function testPUTUpdate(){
	create.dashboard_url = "http://saucelabs.com/account";
	expectedReply.dashboard_url = "http://saucelabs.com/account";
	request
		.put(baseUrl)
		.set("Authorization", auth)
		.set("Accept", "application/json")
		.send(create)
		.expect("Content-Type", /json/)
		.expect(200, expectedReply)
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Put (update) OK");
				testPATCH();
			}
		});
}

function testPATCH(){
	create.dashboard_url = "http://saucelabs.com/PATCH";
	request
		.patch(baseUrl)
		.set("Authorization", auth)
		.set("Accept", "application/json")
		.send(create)
		.expect("Content-Type", /json/)
		.expect(200, {})
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Patch OK");
				testBind();
			}
		});
}

/*
 * Test ../:sid/toolchains/:tid route (PUT)
 */
function testBind(){
	request
		.put(baseUrl + "/toolchains/AAA")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Bind OK");
				testUnbind();
			}
		});
}

/*
 * Test ../:sid/toolchains/:tid route (DELETE)
 */
function testUnbind(){
	request
		.delete(baseUrl + "/toolchains/AAA")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Unbind OK");
				testBind2();
			}
		});
}

/*
 * Test ../:sid/toolchains/:tid route (PUT)
 */
function testBind2(){
	request
		.put(baseUrl + "/toolchains/AAA")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Bind OK");
				testBind3();
			}
		});
}
/*
 * Test ../:sid/toolchains/:tid route (PUT)
 */
function testBind3(){
	request
		.put(baseUrl + "/toolchains/BBB")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Bind OK");
				testUnbind2();
			}
		});
}

/*
 * Test ../:sid/toolchains/:tid route (DELETE)
 */
function testUnbind2(){
	request
		.delete(baseUrl + "/toolchains/AAA")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Unbind OK");
				testUnbindAll();
			}
		});
}
/*
 * Test ../:sid/toolchains route (DELETE)
 */
function testUnbindAll(){
	request
		.delete(baseUrl + "/toolchains")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Unbind all OK");
				testDelete();
			}
		});
}
/*
 * Test ../:sid route (DELETE)
 */
function testDelete(){
	request
		.delete(baseUrl)
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			if (err) {
				throw err;
			} else {
				console.log("Delete OK");
				console.log("All tests OK");
			}
		});
}