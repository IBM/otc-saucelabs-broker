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
	router = express.Router(),
	dbSettings = config.getDbSettings(config.env),
    cloudant = require('cloudant')(dbSettings.url),
    db_name = dbSettings.db_name,
    db = cloudant.db.use(db_name);

var logger = log4js.getLogger("service-instances");

router.put("/:sid", createOrUpdateServiceInstance);
router.patch("/:sid", patchServiceInstance);
router.put("/:sid/toolchains/:tid", bindServiceInstance)
router.delete("/:sid", deleteServiceInstance)
router.delete("/:sid/toolchains", unbindServiceInstanceFromAllToolchains)
router.delete("/:sid/toolchains/:tid", unbindServiceInstanceFromToolchain)

module.exports = router;


cloudant.db.get(db_name, function(err, body) {
	if (!err) {
		logger.info("Using database " +  db_name);
	} else {
		cloudant.db.create(db_name, function(err, body) {
			if (!err) {
				logger.info('Created database ' + db_name);
			} else {
				logger.error("Failed to get/create database " + db_name);
				logger.error("Make sure cloudant connection parameters and access are correct and try again");
			}
		});
	}
});

function validateParameters(params){
	var required = ["username","key"];
	try {
		var p = JSON.parse(params);
		for (var i = 0; i < required.length; i++){
			if (!(p[required[i]] && p[required[i]].length > 0)) {
				return false;
			}
		}
		return true;
	} catch (e) {
		return false;
	}

}
function diffArray(a, b) {
  var seen = [], diff = [];
  for ( var i = 0; i < b.length; i++)
      seen[b[i]] = true;
  for ( var i = 0; i < a.length; i++)
      if (!seen[a[i]])
          diff.push(a[i]);
  return diff;
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

	db.get(sid, function(err, body) {
		if (!err) {
	    	doc._rev = body._rev;
	    	description = "Could not update service instance";
	    }
	    doc._id = sid;
	    for (var i = 0; i < paramsToPatch.length; i++){
	    	doc[paramsToPatch[i]] = req.body[paramsToPatch[i]];
	    }
	    for (var i = 0; i < paramsToKeep.length; i++){
	    	doc[paramsToKeep[i]] = body[paramsToKeep[i]];
	    }

	    db.insert(doc, function(err, body, header) {
	      if (err) {
	        res.status(400).json({description: description});
	      } else {
	      	res.status(200).json({});
	      }
	    });
	});
	return;
}

function createOrUpdateServiceInstance (req, res) {

	var sid = req.params.sid,
		doc = {
			dashboard_url: req.body.dashboard_url || config.dashboardUrl,
			parameters: req.body.parameters || {}
	    },
	    description = "Could not create service instance";

	db.get(sid, function(err, body) {
		if (!err) {
	    	doc._rev = body._rev;
	    	description = "Could not update service instance";
	    	if (req.body.parameters){
	    		if (!validateParameters(doc.parameters)){
					res.status(400).json({description: "Could not validate parameters. username and key are required"});
					return;
				}
	    	} else {
	    		doc.parameters = body.parameters;
	    	}
	    } else {
	    	if (!validateParameters(doc.parameters)){
				res.status(400).json({description: "Could not validate parameters. username and key are required"});
				return;
			}
	    }
	    doc._id = sid;
	    if (body && body.binds){
	    	doc.binds = body.binds;
	    }
	    db.insert(doc, function(err, body, header) {
	      if (err) {
	        res.status(400).json({description: description});
	      } else {
	      	res.status(200).json({
				instance_id: sid,
				dashboard_url: doc.dashboard_url,
				parameters: doc.parameters
			});
	      }
	    });
	});
	return;
}


function bindServiceInstance (req, res) {
	var sid = req.params.sid,
		tid = req.params.tid,
		doc = {};
	db.get(sid, function(err, body) {
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
	    db.insert(doc, function(err, body, header) {
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
	db.get(sid, function(err, body) {
		if (err) {
	    	res.status(404).json({description: "No such service instance: " + sid});
	    	return;
	    } else {
			db.destroy(sid, body._rev, function(err, body, header) {
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
	db.get(sid, function(err, body) {
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
	    db.insert(doc, function(err, body, header) {
	      if (err) {
	        res.status(400).json({description: "Failed to unbind all service instances from toolchain " + tid});
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
	db.get(sid, function(err, body) {
		if (err) {
	    	res.status(404).json({description: "No such service instance: " + sid});
	    	return;
	    } else {
			doc._rev = body._rev;
			doc._id = sid;
	    }
	    var binds = body.binds || [],
	    	idx = binds.indexOf(tid),
	    	arr = [];
	    if (idx === -1) {
	    	res.status(404).json({description: "No such bound toolchain: " + tid});
	    	return;
	    } else {
	    	binds.splice(idx, 1);
	    }
	    doc.binds = binds;
		doc.dashboard_url = body.dashboard_url;
		doc.parameters = body.parameters;
	    db.insert(doc, function(err, body, header) {
	      if (err) {
	        res.status(400).json({description: "Failed to unbind toolchain " + tid + " to service instance " + sid});
	      } else {
			res.status(204).end();
	      }
	    });
	});
	return;
}