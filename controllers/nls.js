/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

require("i18n");

var msgs = require("../nls/msgs.properties");

module.exports = function(req, res, next) {
    switch(req.method) {
    case "GET":
        var nls = {
            "error.sauce_creds": msgs.get("error.sauce_creds", req),
            "error.org_missing" :msgs.get("error.org_missing", req),
            "error.usernamekey_missing" :msgs.get("error.usernamekey_missing", req),
            "error.alreadybound": msgs.get("error.alreadybound", ["XXX", "XXX"], req),
            "error.failedtobind": msgs.get("error.failedtobind", ["XXX", "XXX"], req),
            "error.nosuchinstance": msgs.get("error.nosuchinstance", ["XXX","XXX"], req),
            "error.deletefail": msgs.get("error.deletefail",["XXX"], req),
            "error.unbindall": msgs.get("error.unbindall",["XXX"], req),
            "error.notbound": msgs.get("error.notbound",["XXX","XXX"], req),
            "error.unbind": msgs.get("error.unbind", ["XXX","XXX"], req),
            "error.database_write": msgs.get("error.database_write", ["XXX","XXX"], req),
            "error.auth": msgs.get("error.auth", req)
        };
        res.status(200).send("<pre>" + JSON.stringify(nls, null, 2) + "</pre>");
        break;
    default:
        res.status(405).json({description: "HTTP 405 - " + req.method + " not allowed for this path"});
    }
};