/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

var log4js = require("log4js");

log4js.configure(process.env.LOG4JS_CONFIG || "./config/log4js.json", {
	reloadSecs: 30
});

var logger = log4js.getLogger("server");

if(process.env.NEW_RELIC_LICENSE_KEY) {
	logger.info("Turning on New Relic APM monitoring");
	require("newrelic");
}

var express = require("express"),
    bodyParser = require("body-parser"),
    config = require("./util/config"),
    cfenv = require("cfenv"),
    authentication = require("./util/authentication"),
    appEnv = cfenv.getAppEnv(),
    app = express(),
    auditLogMiddleware = require("qradar-audit-logs-middleware");

var appstatus = require("./controllers/status"),
    version = require("./controllers/version"),
    nls = require("./controllers/nls"),
    service_instances = require("./controllers/service-instances");

var requestLogger = log4js.connectLogger(log4js.getLogger("request"), { format: ":method :url :status - :response-time ms" });

var router = express.Router({
  caseSensitive: true,
  mergeParams: true
});

router
  .use(bodyParser.json())
  .use(requestLogger)
  .all("/status", appstatus)
  .all("/version", version)
  .all("/nls", nls)
  .use(config.contextRoot + config.contextPath + "/service_instances", service_instances);


app
  .use(function (req, res, next) {
    // If a request comes in that appears to be http, reject it.
    if (req.headers["x-forwarded-proto"] && req.headers["x-forwarded-proto"] !== "https") {
      return res.status(501).send("https required");
    }
    next();
  })
  .use(authentication())
  .use(auditLogMiddleware(log4js.getLogger("audit-logs")))
  .use(router)
  .listen(appEnv.port, function () {
    logger.info("Sauce Labs broker starting on: " + appEnv.url);
  });
