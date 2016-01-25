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
    database = require("../util/database");

router.put("/:sid", createOrUpdateServiceInstance);
router.patch("/:sid", patchServiceInstance);
router.put("/:sid/toolchains/:tid", bindServiceInstance);
router.delete("/:sid", deleteServiceInstance);
router.delete("/:sid/toolchains", unbindServiceInstanceFromAllToolchains);
router.delete("/:sid/toolchains/:tid", unbindServiceInstanceFromToolchain);

module.exports = router;

database.init(function(status){

});

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

function patchServiceInstance (req, res) {
	var sid = req.params.sid,
		params = ["dashboard_url", "parameters"],
	    description = "Could not create service instance",
	    paramsToPatch = [],
	    doc = {};
	for (var i = 0; i < params.length; i++){
		if (req.body[params[i]]){
			paramsToPatch.push(params[i]);
		}
	}

	if (paramsToPatch.indexOf("parameters") !== -1 && !validateParameters(req.body.parameters)){
		res.status(400).json({description: "Could not validate parameters. username and key are required"});
		return;
	}
	var paramsToKeep = [];

	params.forEach(function(key) {
	    if (-1 === paramsToPatch.indexOf(key)) {
	        paramsToKeep.push(key);
	    }
	}, this);

	paramsToKeep.push("binds");

	database.get(sid, function(err, body) {
		if (!err) {
	    	doc._rev = body._rev;
	    	description = "Could not update service instance";
	    }
	    doc._id = sid;
	    var i;
	    for (i = 0; i < paramsToPatch.length; i++){
	    	doc[paramsToPatch[i]] = req.body[paramsToPatch[i]];
	    }
	    for (i = 0; i < paramsToKeep.length; i++){
	    	doc[paramsToKeep[i]] = body[paramsToKeep[i]];
	    }
		saucelabs.validateCredentials(doc.parameters, function(ok){
			if(!ok){
				res.status(401).json({description: "Saucelabs credentials could not be verified"});
				return;
	    	}
		    database.insert(doc, function(err, body, header) {
		      if (err) {
		        res.status(400).json({description: description});
		      } else {
		      	res.status(200).json({});
		      }
		    });
		});
	});
	return;
}

function createOrUpdateServiceInstance (req, res) {

	var sid = req.params.sid,
	    params = ["dashboard_url", "parameters"],
	    paramsToPatch = [],
	    description = "Could not create service instance",
	    doc = {};

	for (var i = 0; i < params.length; i++){
		if (req.body[params[i]]){
			paramsToPatch.push(params[i]);
		}
	}

	if (paramsToPatch.indexOf("parameters") !== -1 && !validateParameters(req.body.parameters)){
		res.status(400).json({description: "Could not validate parameters. username and key are required"});
		return;
	}

	var paramsToKeep = [];

	params.forEach(function(key) {
	    if (-1 === paramsToPatch.indexOf(key)) {
	        paramsToKeep.push(key);
	    }
	}, this);

	paramsToKeep.push("binds");

	database.get(sid, function(err, body) {
		if (!err) {
	    	doc._rev = body._rev;
	    	description = "Could not update service instance";
	    }
	    doc._id = sid;
	    var i;
	    for (i = 0; i < paramsToPatch.length; i++){
	    	doc[paramsToPatch[i]] = req.body[paramsToPatch[i]];
	    }
	    if (body){
	    	for (i = 0; i < paramsToKeep.length; i++){
	    		doc[paramsToKeep[i]] = body[paramsToKeep[i]];
	    	}
		} else {
			if(paramsToKeep.indexOf("dashboard_url") !== -1){
	    		doc.dashboard_url = config.dashboardUrl;
	    	}
		}
	    saucelabs.validateCredentials(doc.parameters, function(ok){
	    	if(!ok){
				res.status(401).json({description: "Saucelabs credentials could not be verified"});
				return;
	    	}
		    database.insert(doc, function(err, body, header) {
		      if (err) {
		        res.status(400).json({description: description});
		      } else {
		      	doc.parameters.label = doc.parameters.username;
		      	res.status(200).json({
					instance_id: sid,
					dashboard_url: doc.dashboard_url,
					parameters: doc.parameters
				});
		      }
		    });
	    });
	});
	return;
}


function bindServiceInstance (req, res) {
	var sid = req.params.sid,
		tid = req.params.tid,
		doc = {};
	database.get(sid, function(err, body) {
		if (err) {
	    	res.status(404).json({description: "No such service instance: " + sid});
	    	return;
	    } else {
			doc._rev = body._rev;
			doc._id = sid;
	    }
	    var binds = body.binds || [];
	    if (binds.indexOf(tid) !== -1){
	    	res.status(400).json({description: "Toolchain " + tid + " already bound to service instance " + sid});
	    	return;
	    }
	    binds.push(tid);
	    doc.binds = binds;
		doc.dashboard_url = body.dashboard_url;
		doc.parameters = body.parameters;
	    database.insert(doc, function(err, body, header) {
	      if (err) {
	        res.status(400).json({description: "Failed to bind toolchain " + tid + " to service instance " + sid});
	      } else {
			res.status(204).end();
	      }
	    });
	});
	return;
}

function deleteServiceInstance (req, res) {
	var sid = req.params.sid;
	database.get(sid, function(err, body) {
		if (err) {
	    	res.status(404).json({description: "No such service instance: " + sid});
	    	return;
	    } else {
			database.destroy(sid, body._rev, function(err, body, header) {
				if (err) {
			    	res.status(500).json({description: "Failed to delete service instance: " + sid});
			    	return;
				} else {
					res.status(204).end();
					return;
				}
			});
	    }
	});
}

function unbindServiceInstanceFromAllToolchains(req, res) {
	var sid = req.params.sid,
		doc = {};
	database.get(sid, function(err, body) {
		if (err) {
	    	res.status(404).json({description: "No such service instance: " + sid});
	    	return;
	    } else {
			doc._rev = body._rev;
			doc._id = sid;
	    }
	    doc.binds = [];
		doc.dashboard_url = body.dashboard_url;
		doc.parameters = body.parameters;
	    database.insert(doc, function(err, body, header) {
	      if (err) {
	        res.status(400).json({description: "Failed to unbind all toolchains from service instances"});
	      } else {
			res.status(204).end();
	      }
	    });
	});
	return;
}

function unbindServiceInstanceFromToolchain (req, res) {
	var sid = req.params.sid,
		tid = req.params.tid,
		doc = {};
	database.get(sid, function(err, body) {
		if (err) {
	    	res.status(404).json({description: "No such service instance: " + sid});
	    	return;
	    } else {
			doc._rev = body._rev;
			doc._id = sid;
	    }
	    var binds = body.binds || [],
	    	idx = binds.indexOf(tid);
	    if (idx === -1) {
	    	res.status(404).json({description: "No such bound toolchain: " + tid});
	    	return;
	    } else {
	    	binds.splice(idx, 1);
	    }
	    doc.binds = binds;
		doc.dashboard_url = body.dashboard_url;
		doc.parameters = body.parameters;
	    database.insert(doc, function(err, body, header) {
	      if (err) {
	        res.status(400).json({description: "Failed to unbind toolchain " + tid + " to service instance " + sid});
	      } else {
			res.status(204).end();
	      }
	    });
	});
	return;
}