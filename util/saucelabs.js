/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

var SauceLabs = require("saucelabs");

exports.validateCredentials = function(creds, callback) {
	var account = new SauceLabs({
	  username: creds.username,
	  password: creds.key
	});
	account.getAccountDetails(function (err, res) {
  		if (err){
  			callback(false);
  		} else {
  			if (typeof res === "undefined"){
  				callback(false);
  			} else {
  				callback(true);
  			}
  		}
	});
};