/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";
var crypto = require("crypto"),
	config = require("./config"),
	localKey = config.localKey;

exports.encrypt = function(str){
	try {
		var cipher = crypto.createCipher("aes-256-ctr", localKey);
		var encrypted = cipher.update(str, "utf82", "hex");
		encrypted += cipher.final("hex");
		return encrypted;
	} catch (e){
		return null;
	}
};

exports.decrypt = function(str){
	try {
		var decipher = crypto.createDecipher("aes-256-ctr", localKey);
		var decrypted = decipher.update(str, "hex", "utf8");
		decrypted += decipher.final("utf8");
		return decrypted;
	} catch (e){
		return null;
	}
};