/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

var config = require("../util/config");

module.exports = function(req, res, next) {

    switch(req.method) {
    case "GET":
            res.status(200).json({build: config.buildNumber || "Unknown"});
        break;
    default:
        res.status(405).send("HTTP 405 - " + req.method + " not allowed for this path");
    }
};