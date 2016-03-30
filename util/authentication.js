/**
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2015. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 */
"use strict";

var config = require("./config"),
	log4js = require("log4js"),
	url = require("url");

var logger = log4js.getLogger("authentication");

/*
 * Uses the access token from the Authorization request header to
 * fetch a user's profile.  If the Authorization header is missing
 * or invalid, the fetch will fail.
 *
 * The profile is tacked onto the request as req.user and will be
 * referenced throughout the API calls.
 */
module.exports = function() {

	return function(req, res, next) {
		var authHeader = req.header("Authorization");

		if (authHeader) {
			// Split header and grab values from it.
			var authHeaderParts = authHeader.split(/\s+/);
			var authPrefix = String(authHeaderParts[0]).toLowerCase();
			var authValue = authHeaderParts[1];

			if (authPrefix === "basic") {
				var id, secret;
				try {
					var creds = new Buffer(authValue, "base64").toString("ascii").split(":");
					id = creds[0];
					secret = creds[1];
				} catch (e) {}
				if (id !== config.tiam_client_id || secret !== config.otc_api_broker_secret) {
					logger.debug("Invalid Basic Credentials provided " + config.otc_api_broker_secret.length);
					return res.status(401).json({description: "An invalid authorization header was passed in."});
				}
				return next();
			} else {
                return res.status(401).json({description: "An invalid authorization header was passed in."});
            }
		} else {
			var requestPath = url.parse(req.url).pathname;
			if (requestPath === "/version" || requestPath === "/status"){
				next();
			} else {
				return res.status(401).json({description: "An invalid authorization header was passed in."});
			}
		}
	};
};