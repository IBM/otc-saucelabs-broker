/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

var saucelabs = require("../util/saucelabs"),
    config = require("../util/config"),
    request = require("request");

var PASS = "PASS",
    PASSCODE = 200,
    FAIL = "FAIL",
    FAILCODE = 500,
    sauce_error_count = 0,
    cloudant_error_count = 0;

module.exports = function(req, res, next) {
    var status = {};
    switch(req.method) {
    case "GET":
        getSaucelabsServiceStatus(function(sauce){
            getCloudantServiceStatus(function(cloud){
                var statusCode;
                if (sauce.status === PASS && cloud.status === PASS){
                    statusCode = PASSCODE;
                    status.status = PASS;
                    status.details = "Saucelabs broker running normally";
                } else {
                    statusCode = FAILCODE;
                    status.status = FAIL;
                    status.details = "One or more dependencies failed";
                }

                status.dependencies = {
                    saucelabs: sauce,
                    cloudant: cloud
                };

                res.status(statusCode).send(status);
            });
        });
        break;
    default:
        res.status(405).json({description: "HTTP 405 - " + req.method + " not allowed for this path"});
    }
};

function getSaucelabsServiceStatus(callback){
    var then = new Date();
    var creds = {
        "username" : process.env.SAUCELABS_USERNAME,
        "key" : process.env.SAUCELABS_KEY
    };
    saucelabs.serviceStatus(creds, function(ok, msg){
        var dep = {};
        dep.status = ok ?  PASS : FAIL;
        dep.details = msg;
        dep.duration = (Date.now() - then.getTime());
        dep.error_count = ok ? 0 : ++sauce_error_count;
        dep.timestamp = then.toISOString();
        callback(dep);
    });
}

function getCloudantServiceStatus(callback){
    var then = new Date();
    request("https://" + config.cloudant_url, function (error, response, body) {
        var dep = {};
        if (!error) {
            dep.status = PASS;
            dep.details = "Cloudant OK";
        } else {
            dep.status = FAIL;
            dep.details = error.message || error;
        }
        dep.duration = (Date.now() - then.getTime());
        dep.error_count = !error ? 0 : ++cloudant_error_count;
        dep.timestamp = then.toISOString();
        callback(dep);
    });
}