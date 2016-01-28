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
	tid1 = "TC1",
	tid2 = "TC2",
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

test("Test that all needed environment variables are defined", function (t) {

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

test("Get authentication token from " + process.env.TOKEN_HOST, function (t) {
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
        	t.equal(err, null);
        	t.equal(("access_token" in res.body), true);
        	auth += res.body.access_token;
        	t.end();
        });
});


test("Cleanup - remove any old " + sid + " instance", function (t) {
	request
		.delete(baseUrl)
		.set("Authorization", auth)
		.end(function(err, res){
			t.end();
		});
});


test("Put (create) " + sid + " instance", function (t) {
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

test("Put (update) " + sid + " instance", function (t) {
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

test("Patch "  + sid + " instance (dashboard_url)", function (t) {
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
test("Bind " + tid1 + " toolchain to " + sid, function (t) {
	request
		.put(baseUrl + "/toolchains/" + tid1)
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
test("Unbind " + tid1 + " toolchain from " + sid, function (t) {
	request
		.delete(baseUrl + "/toolchains/" + tid1)
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
test("Bind " + tid1 + " toolchain to " + sid, function (t) {
	request
		.put(baseUrl + "/toolchains/" +tid1)
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
test("Bind " + tid2 + " toolchain to " + sid, function (t) {
	request
		.put(baseUrl + "/toolchains/" + tid2)
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
test("Unbind " + tid1 + " toolchain from " + sid, function (t) {
	request
		.delete(baseUrl + "/toolchains/" + tid1)
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
test("Unbind all toolchains from " + sid, function (t) {
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
test("Delete service instance " + sid, function (t) {
	request
		.delete(baseUrl)
		.set("Authorization", auth)
		.expect(204)
		.end(function(err, res){
			t.equal(err, null);
            t.end();
		});
});