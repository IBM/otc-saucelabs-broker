/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

var fs = require("fs"),
    VERSION;

try {
	VERSION = JSON.parse(fs.readFileSync("build_info.json", {encoding: "utf-8"}));
} catch (e) {
	//ignore any errors, we don't want local startups with an ERROR log
}

module.exports = function(req, res, next) {

    switch(req.method) {
    case "GET":
            res.status(200).json(VERSION || {build: "Unknown"});
        break;
    default:
        res.status(405).json({description: "HTTP 405 - " + req.method + " not allowed for this path"});
    }
};