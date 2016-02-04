/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

var express = require("express"),
	router = express.Router(),
	config = require("../util/config"),
    saucelabs = require("../util/saucelabs"),
    database = require("../util/database"),
    log4js = require("log4js"),
    logger = log4js.getLogger("service-instance");

router.put("/:sid", createOrUpdateServiceInstance);
router.patch("/:sid", createOrUpdateServiceInstance);
router.put("/:sid/toolchains/:tid", bindServiceInstance);
router.delete("/:sid", deleteServiceInstance);
router.delete("/:sid/toolchains", unbindServiceInstanceFromAllToolchains);
router.delete("/:sid/toolchains/:tid", unbindServiceInstanceFromToolchain);

module.exports = router;

database.init();

function createOrUpdateServiceInstance (req, res) {

	var sid = req.params.sid,
	    params = ["dashboard_url", "parameters", "organization_guid"],
	    paramsToUpdate = [];

	for (var i = 0; i < params.length; i++){
		if (req.body[params[i]]){
			paramsToUpdate.push(params[i]);
		}
	}

	if (paramsToUpdate.indexOf("parameters") !== -1 && !validateParameters(req.body.parameters)){
		res.status(400).json({description: "Could not validate parameters. username and key are required"});
		return;
	}

	database.getDocument(sid, function(doc){
		if (doc){
			updateDocument(doc, req, res, paramsToUpdate);
		} else {
			createDocument(req, res, paramsToUpdate);
		}
	});
}

function validateParameters(params){
	var required = ["username","key"];
	try {
		for (var i = 0; i < required.length; i++){
			if (!(params[required[i]] && params[required[i]].length > 0)) {
				return false;
			}
		}
		return true;
	} catch (e) {
		return false;
	}
}

function createDocument(req, res, paramsToUpdate) {
	var doc = {},
		i;
	doc._id = req.params.sid;
	for (i = 0; i < paramsToUpdate.length; i++){
	    doc[paramsToUpdate[i]] = req.body[paramsToUpdate[i]];
	}
	if(paramsToUpdate.indexOf("dashboard_url") === -1){
	    doc.dashboard_url = config.dashboardUrl;
	}
	validateAndInsert(doc, req, res);
}

function updateDocument(doc, req, res, paramsToUpdate){
	var i;
	for (i = 0; i < paramsToUpdate.length; i++){
		if (paramsToUpdate[i] !== "organization_guid"){
			doc[paramsToUpdate[i]] = req.body[paramsToUpdate[i]];
		}
	}
	validateAndInsert(doc, req, res);
}

function validateAndInsert(doc, req, res) {
	if(!isValidOrganization(doc.organization_guid, req.user.organizations)) {
		return res.status(403).json({ "description": "Error: User is not part of the organization." });
	}
	saucelabs.validateCredentials(doc.parameters, function(ok){
		if(!ok){
			res.status(400).json({description: "Saucelabs credentials could not be verified"});
			return;
		}
	    database.insertDocument(doc, function(result) {
			if (result) {
				var json = {};
				if (req.method !== "PATCH") {
					doc.parameters.label = doc.parameters.username;
					json = {
						instance_id: doc._id,
						dashboard_url: doc.dashboard_url,
						parameters: doc.parameters
					};
				}
				res.status(200).json(json);
			} else {
				res.status(400).json({description: "Could not write to database"});
			}
	    });
	});
}

function bindServiceInstance (req, res) {
	var sid = req.params.sid,
		tid = req.params.tid;

	database.getDocument(sid, function(doc){
		if (doc){
			if(!isValidOrganization(doc.organization_guid, req.user.organizations)) {
				return res.status(403).json({ "description": "Error: User is not part of the organization." });
			}
			var binds = doc.binds || [];
			if (binds.indexOf(tid) !== -1){
				res.status(400).json({description: "Toolchain " + tid + " already bound to service instance " + sid});
				return;
			}
			binds.push(tid);
			doc.binds = binds;
			database.insertDocument(doc, function(result) {
				if (result) {
					res.status(204).end();
				} else {
					res.status(400).json({description: "Failed to bind toolchain " + tid + " to service instance " + sid});
				}
			});
		} else {
			res.status(404).json({description: "No such service instance: " + sid});
		}
	});
}

function deleteServiceInstance (req, res) {
	var sid = req.params.sid;

	database.getDocument(sid, function(doc){
		if (doc){
			if(!isValidOrganization(doc.organization_guid, req.user.organizations)) {
				return res.status(403).json({ "description": "Error: User is not part of the organization." });
			}
			database.deleteDocument(doc, function(result) {
				if (result) {
					res.status(204).end();
				} else {
					res.status(500).json({description: "Failed to delete service instance: " + sid});
				}
			});
		} else {
			res.status(404).json({description: "No such service instance: " + sid});
		}
	});
}

function unbindServiceInstanceFromAllToolchains(req, res) {
	var sid = req.params.sid;

	database.getDocument(sid, function(doc){
		if (doc){
			if(!isValidOrganization(doc.organization_guid, req.user.organizations)) {
				return res.status(403).json({ "description": "Error: User is not part of the organization." });
			}
			doc.binds = [];
			database.insertDocument(doc, function(result) {
				if (result) {
					res.status(204).end();
				} else {
					res.status(400).json({description: "Failed to unbind all toolchains from service instances"});
				}
			});
		} else {
			res.status(404).json({description: "No such service instance: " + sid});
		}
	});
}

function unbindServiceInstanceFromToolchain (req, res) {
	var sid = req.params.sid,
		tid = req.params.tid;

	database.getDocument(sid, function(doc){
		if (doc){
			if(!isValidOrganization(doc.organization_guid, req.user.organizations)) {
				return res.status(403).json({ "description": "Error: User is not part of the organization." });
			}
			var binds = doc.binds || [],
				idx = binds.indexOf(tid);
			if (idx === -1) {
				res.status(404).json({description: "No such bound toolchain: " + tid});
				return;
			} else {
				binds.splice(idx, 1);
			}
			doc.binds = binds;
			database.insertDocument(doc, function(result) {
				if (result) {
					res.status(204).end();
				} else {
					res.status(400).json({description: "Failed to unbind toolchain " + tid + " to service instance " + sid});
				}
			});
		} else {
			res.status(204).end();
			logger.error("Unbind - No such service instance: " + sid + " (command ignored)");
		}
	});
}

/**
* Note: Brokers implementing this check should ideally reference an auth-cache.
* @param orgToValidate - The organization_guid to check the user is a member of.
* @param usersOrgs - An array of organization_guids the user is actually a member of.
**/
function isValidOrganization (orgToValidate, usersOrgs) {
    if (orgToValidate && usersOrgs) {
        for (var i = 0; i < usersOrgs.length; i++) {
            if (usersOrgs[i].guid === orgToValidate) {
                return true;
            }
        }
    }

    return false;
}