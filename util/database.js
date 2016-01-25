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
    db = cloudant.db.use(db_name);

var logger = log4js.getLogger("database");

exports.init = function(callback) {
	cloudant.db.get(db_name, function(err, body) {
		var dbInfo = "database " +  db_name +  " on " + url.parse(config.cloudant_url).host;
		if (!err) {
			logger.info("Using " + dbInfo);
			callback(true);
		} else {
			cloudant.db.create(db_name, function(err, body) {
				if (!err) {
					logger.info("Created database " + dbInfo);
					callback(true);
				} else {
					logger.error("Failed to get/create " + dbInfo);
					logger.error("Make sure cloudant connection parameters and access are correct and try again");
					callback(false);
				}
			});
		}
	});
};

exports.insert = function(doc, callback) {
	db.insert(doc, function(err, body, header) {
		callback(err, body, header);
	});
};

exports.get = function(id, callback) {
	db.get(id, function(err, body) {
		callback(err, body);
	});
};

exports.destroy = function(id, rev, callback) {
	db.destroy(id, rev, function(err, body, header) {
		callback(err, body, header);
	});
};
