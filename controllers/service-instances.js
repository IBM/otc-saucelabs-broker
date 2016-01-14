/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2015, 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
 
var express = require('express'),
	request = require('request'),
	log4js = require("log4js"),
	config = require('../util/config'),
	router = express.Router();

var logger = log4js.getLogger("service-instances");

router.put("/:sid", createOrUpdateServiceInstance)
router.put("/:sid/toolchains/:tid", bindServiceInstance)
router.delete("/:sid", deleteServiceInstance)
router.delete("/:sid/toolchains", unbindServiceInstanceFromAllToolchains)
router.delete("/:sid/toolchains/:tid", unbindServiceInstanceFromToolchain)

module.exports = router;

function makeGuid() {
    // slightly simplified. we're giving up 2 bis of randomness by
    // hardcoding the 8, which should be one of ['8', '9', 'a', 'b']
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, function(c) {
        return Math.round(Math.random() * 16).toString(16);
    });
}

function createOrUpdateServiceInstance (req, res) {
	token = req.headers['authorization'];

	// if (!token) {
	// 	res.status(401).json({description: "User is not authenticated"});
	// 	return;
	// }

	res.status(200).json({ 
		instance_id: makeGuid(),
		dashboard_url: config.dashboardUrl
	});
	return;
}

function bindServiceInstance (req, res) {
	var serviceInstanceId = req.params.sid,
	toolchainId = req.params.tid,
	token = req.headers['authorization'];

	// if (!token) {
	// 	res.status(401).json({description: "User is not authenticated"});
	// 	return;
	// }

	res.status(204).end();
	return;
}

function deleteServiceInstance (req, res) {
	var serviceInstanceId = req.params.sid,
	toolchainId = req.params.tid,
	token = req.headers['authorization'];

	// if (!token) {
	// 	res.status(401).json({description: "User is not authenticated"});
	// 	return;
	// }

	res.status(204).end();
	return;
}

function unbindServiceInstanceFromAllToolchains (req, res) {
	var serviceInstanceId = req.params.sid,
	toolchainId = req.params.tid,
	token = req.headers['authorization'];

	// if (!token) {
	// 	res.status(401).json({description: "User is not authenticated"});
	// 	return;
	// }

	res.status(204).end();
	return;
}

function unbindServiceInstanceFromToolchain (req, res) {
	var serviceInstanceId = req.params.sid,
	toolchainId = req.params.tid,
	token = req.headers['authorization'];

	// if (!token) {
	// 	res.status(401).json({description: "User is not authenticated"});
	// 	return;
	// }

	res.status(204).end();
	return;
}
