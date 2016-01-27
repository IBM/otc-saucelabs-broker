/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


var request = require("supertest"),
	config = require("../util/config");

request = request(process.env.TEST_URL);


var sid = "TEST",
	create = {
		"dashboard_url": "http://sourcelab.override.config.com",
		"parameters": {"username":"", "key":""}
	},
	baseUrl = config.contextRoot + config.contextPath + "/service_instances/" + sid,
	expectedReply = create;

create.parameters.username = process.env.SAUCELABS_USERNAME;
create.parameters.key = process.env.SAUCELABS_KEY;

expectedReply.instance_id = sid;
expectedReply.parameters.label = expectedReply.parameters.username;

testPUTCreate();

/*
 * Test ../:sid route (PUT/PATCH)
 */
function testPUTCreate(){
	request
		.put(baseUrl)
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
	expectedReply.dashboard_url = "http://saucelabs.com/account";
	request
		.put(baseUrl)
		.set("Accept", "application/json")
		.send({"dashboard_url":"http://saucelabs.com/account"})
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
	request
		.patch(baseUrl)
		.set("Accept", "application/json")
		.send({"dashboard_url":"http://saucelabs.com/PATCH"})
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