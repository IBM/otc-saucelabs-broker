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
	auth = "Basic " + new Buffer(config.otc_api_broker_id + ":" + config.otc_api_broker_secret).toString("base64");




create.parameters.username = process.env.SAUCELABS_USERNAME;
create.parameters.key = process.env.SAUCELABS_KEY;
create.organization_guid = process.env.ORGANIZATION_GUID;

expectedReply.instance_id = sid;
expectedReply.parameters.username = process.env.SAUCELABS_USERNAME;
expectedReply.parameters.key = process.env.SAUCELABS_KEY;
expectedReply.parameters.label = expectedReply.parameters.username;

test("Setup and test preparation", function (tst) {

	tst.test("Test that all needed environment variables are defined", function (t) {

		var env = ["TEST_URL", "SAUCELABS_USERNAME","SAUCELABS_KEY","ORGANIZATION_GUID","TEST_USER","TEST_PASSWORD"];
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

	tst.test("Cleanup - remove any old " + sid + " instance", function (t) {
		request
			.delete(baseUrl)
			.set("Authorization", auth)
			.end(function(err, res){
				t.end();
			});
	});
});

test("Test normal operation", function (tst) {
	tst.test("Put (create) " + sid + " instance", function (t) {
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

	tst.test("Put (update) " + sid + " instance", function (t) {
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

	tst.test("Patch "  + sid + " instance (dashboard_url)", function (t) {
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

	tst.test("Bind " + tid1 + " toolchain to " + sid, function (t) {
		request
			.put(baseUrl + "/toolchains/" + tid1)
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Unbind " + tid1 + " toolchain from " + sid, function (t) {
		request
			.delete(baseUrl + "/toolchains/" + tid1)
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Bind " + tid1 + " toolchain to " + sid, function (t) {
		request
			.put(baseUrl + "/toolchains/" +tid1)
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Bind " + tid2 + " toolchain to " + sid, function (t) {
		request
			.put(baseUrl + "/toolchains/" + tid2)
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Unbind " + tid1 + " toolchain from " + sid, function (t) {
		request
			.delete(baseUrl + "/toolchains/" + tid1)
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Unbind all toolchains from " + sid, function (t) {
		request
			.delete(baseUrl + "/toolchains")
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Delete service instance " + sid, function (t) {
		request
			.delete(baseUrl)
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});
});

test("Test errors operation", function (tst) {
	tst.test("Put (create) " + sid + " instance with wrong saucelabs credentials", function (t) {
		create.parameters.username = "foobar";
		request
			.put(baseUrl)
			.set("Authorization", auth)
			.set("Accept", "application/json")
			.send(create)
			.expect("Content-Type", /json/)
			.expect(400)
			.end(function(err, res){
				t.equal(err, null);
				create.parameters.username = process.env.SAUCELABS_USERNAME;
	            t.end();
			});
	});

	tst.test("Put (create) " + sid + " instance with missing parameters", function (t) {
		delete create.parameters;
		request
			.put(baseUrl)
			.set("Authorization", auth)
			.set("Accept", "application/json")
			.send(create)
			.expect("Content-Type", /json/)
			.expect(400)
			.end(function(err, res){
				t.equal(err, null);
				create.parameters = {};
				create.parameters.username = process.env.SAUCELABS_USERNAME;
				create.parameters.key = process.env.SAUCELABS_KEY;
	            t.end();
			});
	});

	tst.test("Put (create) " + sid + " instance with empty parameters", function (t) {
		create.parameters.username = "";
		create.parameters.key = "";
		request
			.put(baseUrl)
			.set("Authorization", auth)
			.set("Accept", "application/json")
			.send(create)
			.expect("Content-Type", /json/)
			.expect(400)
			.end(function(err, res){
				t.equal(err, null);
				create.parameters = {};
				create.parameters.username = process.env.SAUCELABS_USERNAME;
				create.parameters.key = process.env.SAUCELABS_KEY;
	            t.end();
			});
	});

	tst.test("Delete non existing service instance " + sid + "x", function (t) {
		request
			.delete(baseUrl + "x")
			.set("Authorization", auth)
			.expect(404)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Put (create) " + sid + " instance", function (t) {
		create.dashboard_url = "http://saucelabs.com/account";
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

	tst.test("Bind " + tid1 + " toolchain to non existing service instance " + sid + "x", function (t) {
		request
			.put(baseUrl + "x" + "/toolchains/" + tid1)
			.set("Authorization", auth)
			.expect(404)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Bind " + tid1 + " toolchain to service instance " + sid, function (t) {
		request
			.put(baseUrl + "/toolchains/" + tid1)
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Bind already bound " + tid1 + " toolchain to service instance " + sid, function (t) {
		request
			.put(baseUrl + "/toolchains/" + tid1)
			.set("Authorization", auth)
			.expect(400)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Unbind not bound " + tid1 + "x" + " toolchain from " + sid, function (t) {
		request
			.delete(baseUrl + "/toolchains/" + tid1 + "x")
			.set("Authorization", auth)
			.expect(404)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Unbind " + tid1  + " toolchain from non existing service instance " + sid + "x", function (t) {
		request
			.delete(baseUrl + "x" + "/toolchains/" + tid1)
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});

	tst.test("Delete service instance " + sid, function (t) {
		request
			.delete(baseUrl)
			.set("Authorization", auth)
			.expect(204)
			.end(function(err, res){
				t.equal(err, null);
	            t.end();
			});
	});
});