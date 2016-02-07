/**
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2015. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 */
"use strict";

var log4js = require("log4js"),
	url = require("url"),
	tiamClient = require("./tiam-client");

var logger = log4js.getLogger("fetch-auth");

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
			var authPrefix = authHeaderParts[0];
			var authValue = authHeaderParts[1];

			if (String(authPrefix).toLowerCase() === "bearer") {
				isAuthenticated(authValue, function(err, statusCode, userInfo) {
					if(statusCode === 200) {
						req.user = userInfo;
						return next();
					} else {
						return res.status(statusCode).json(err);
					}
				});
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

// Note: Brokers implementing this check should ideally reference an auth-cache.
function isAuthenticated(bearerToken, callback) {

    if(!bearerToken) {
        logger.error("Looking up the user profile failed due to an undefined bearer token.");
        return callback({description : "There was an error authenticating."}, 500, null);
    }

	return tiamClient.getWhoami(bearerToken, function(err, r) {
        if (err) {
            logger.error("Looking up the user profile from TIAM failed with the following error: " + JSON.stringify(err));
            return callback(err, r, null);
        }

        if(!r.whoami_lease_expiry) {
            logger.error("Unable to find the bearer token lease expiry from TIAM.");
            return callback({description : "There was an error authenticating."}, 500, null);
        }

        var maxAge = r.whoami_lease_expiry - new Date().valueOf();
        if(maxAge < 0) {
            logger.error("The entry returned from TIAM has expired.");
            return callback({description : "There was an error authenticating."}, 500, null);
        }

        return callback(null, 200, r);
    });
}