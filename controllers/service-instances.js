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
	cloudant_config = {account:config.cloudant_username, password:config.cloudant_password},
    cloudant = require('cloudant')(cloudant_config),
    db_name = config.db_name,
    db = cloudant.db.use(db_name);

var logger = log4js.getLogger("service-instances");

router.put("/:sid", createOrUpdateServiceInstance);
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

function makeGuid() {
    // slightly simplified. we're giving up 2 bis of randomness by
    // hardcoding the 8, which should be one of ['8', '9', 'a', 'b']
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, function(c) {
        return Math.round(Math.random() * 16).toString(16);
    });
}

function createOrUpdateServiceInstance (req, res) {

	var sid = req.params.sid,
		instance_id = makeGuid(),
		doc = {
	    	instance_id: req.body.instance_id || instance_id,
			dashboard_url: req.body.dashboardUrl || config.dashboardUrl,
			parameters: req.body.parameters || {}
	    },
	    description = "Could not create service instance";

	db.get(sid, function(err, body) {
		if (!err) {
	    	doc._rev = body._rev;
	    	description = "Could not update service instance";
	    }
	    doc._id = sid;
	    db.insert(doc, function(err, body, header) {
	      if (err) {
	        res.status(400).json({description: description});
	      } else {
	      	res.status(200).json({
				instance_id: doc.instance_id,
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
	    doc.instance_id =  body.instance_id;
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
	    doc.instance_id =  body.instance_id;
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
	    doc.instance_id =  body.instance_id;
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