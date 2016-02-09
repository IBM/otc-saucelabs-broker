/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

var SauceLabs = require("saucelabs"),
  log4js = require("log4js"),
  logger = log4js.getLogger("saucelabs");

exports.validateCredentials = function(creds, callback) {
  if (typeof creds === "undefined"){
    logger.error("Tried to validate undefined credentials");
    return callback(false);
  }
	var account = new SauceLabs({
	  username: creds.username,
	  password: creds.key
	});
	account.getAccountDetails(function (err, res) {
  		if (err){
        logger.error("Failed to validate saucelabs credentials");
  			callback(false);
  		} else {
  			if (typeof res === "undefined"){
          logger.error("Failed to validate saucelabs credentials: response undefined");
  				callback(false);
  			} else {
  				callback(true);
  			}
  		}
	});
};