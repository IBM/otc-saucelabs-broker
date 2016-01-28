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
	request2 = require("superagent"),
	test = require("tape");

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

test("Test environment variables", function (t) {

	var env = ["TEST_URL", "SAUCELABS_USERNAME","SAUCELABS_KEY","ORGANIZATION_GUID","SAUCELABS_USERNAME","SAUCELABS_KEY","TEST_USER","TEST_PASSWORD","TOKEN_HOST"];
	var count = 0;
	for(var i = 0; i < env.length;i++){
		if (typeof process.env[env[i]] === "undefined"){
			//throw "Missing env var " + env[i];
		} else {
			count++;
		}
	}
	t.equal(env.length, count);
	t.end();
});





test("Get authentication token", function (t) {
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
        	t.equal(("access_token" in res.body), true);
        	t.equal(err, null);
        	auth += res.body.access_token;
        	t.end();
        });
});


test("Cleanup", function (t) {
	request
		.delete(baseUrl)
		.set("Authorization", auth)
		.end(function(err, res){
			t.end();
		});
});


test("PUT (create)", function (t) {
	request
		.put(baseUrl)
		.set("Authorization", auth)
		.set("Accept", "application/json")
		.send(create)
		.expect("Content-Type", /json/)
		.expect(200, expectedReply)
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});

test("PUT (update)", function (t) {
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
			t.equal(err, null);
            t.end();
		});
});

test("PATCH", function (t) {
	create.dashboard_url = "http://saucelabs.com/PATCH";
	request
		.patch(baseUrl)
		.set("Authorization", auth)
		.set("Accept", "application/json")
		.send(create)
		.expect("Content-Type", /json/)
		.expect(200, {})
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});

/*
 * Test ../:sid/toolchains/:tid route (PUT)
 */
test("Bind", function (t) {
	request
		.put(baseUrl + "/toolchains/AAA")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});

/*
 * Test ../:sid/toolchains/:tid route (DELETE)
 */
test("Unbind", function (t) {
	request
		.delete(baseUrl + "/toolchains/AAA")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});

/*
 * Test ../:sid/toolchains/:tid route (PUT)
 */
test("Bind", function (t) {
	request
		.put(baseUrl + "/toolchains/AAA")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});
/*
 * Test ../:sid/toolchains/:tid route (PUT)
 */
test("Bind", function (t) {
	request
		.put(baseUrl + "/toolchains/BBB")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});

/*
 * Test ../:sid/toolchains/:tid route (DELETE)
 */
test("Unbind", function (t) {
	request
		.delete(baseUrl + "/toolchains/AAA")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});
/*
 * Test ../:sid/toolchains route (DELETE)
 */
test("Unbind all", function (t) {
	request
		.delete(baseUrl + "/toolchains")
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});
/*
 * Test ../:sid route (DELETE)
 */
test("Delete", function (t) {
	request
		.delete(baseUrl)
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});