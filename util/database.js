/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

var log4js = require("log4js"),
	url = require("url"),
	config = require("../util/config"),
    cloudant = require("cloudant")(config.cloudant_url),
    db_name = config.cloudant_database,
    db = cloudant.db.use(db_name),
    database_ok = false;

var logger = log4js.getLogger("database");

exports.init = function() {
	cloudant.db.get(db_name, function(err, body) {
		var dbInfo = "database " +  db_name +  " on " + url.parse(config.cloudant_url).host;
		if (!err) {
			logger.info("Using " + dbInfo);
			database_ok = true;
			return true;
		} else {
			cloudant.db.create(db_name, function(err, body) {
				if (!err) {
					logger.info("Created database " + dbInfo);
					database_ok = true;
					return true;
				} else {
					logger.error("Failed to get/create " + dbInfo);
					logger.error("Make sure cloudant connection parameters and access are correct and try again");
					return false;
				}
			});
		}
	});
};

exports.getDocument = function(id, callback) {
	db.get(id, function(err, body) {
		if (!err && body) {
			callback(body);
		} else {
			callback(null);
		}
	});
};

exports.insertDocument = function(doc, callback) {
	db.insert(doc, function(err, body, header) {
		if (!err && body) {
			callback(body);
		} else {
			callback(null);
		}
	});
};

exports.deleteDocument = function(doc, callback) {
	db.destroy(doc._id, doc._rev, function(err, body, header) {
		if (!err && body) {
			callback(body);
		} else {
			callback(null);
		}
	});
};


exports.validateRead = function(callback){
	cloudant.db.list(function(err, allDbs) {
		if (err){
			callback(false, "Could not read from the database");
		} else {
			if (allDbs.indexOf(db_name) !== -1){
				callback(true);
			} else {
				callback(false, "Could not find the database");
			}
		}
	});
};

exports.isOk = function() {
	return database_ok;
};