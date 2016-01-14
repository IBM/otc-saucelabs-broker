/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

var express = require("express"),
    log4js = require("log4js"),
    bodyParser = require("body-parser"),
    config = require("./util/config"),
    https = require("https"),
    fs = require("fs"),
    cfenv = require("cfenv"),
    appEnv = cfenv.getAppEnv(),
    app = express();

var status = require("./controllers/status"),
    version = require("./controllers/version"),
    service_instances = require("./controllers/service-instances");

log4js.configure(process.env.LOG4JS_CONFIG || "./config/log4js.json", {
	reloadSecs: 30
});

var requestLogger = log4js.connectLogger(log4js.getLogger("request"), { format: ":method :url :status - :response-time ms" });

var logger = log4js.getLogger("server");

var router = express.Router({
  caseSensitive: true,
  mergeParams: true
});

app.use(config.contextRoot, router);

router.use(bodyParser.json());
router.use(requestLogger);

router
  .all("/status", status)
  .all("/version", version)
  .use(config.contextPath + '/service_instances', service_instances);


var keysDir = "keys";
var options = {
  key: fs.readFileSync(keysDir + "/privatekey.pem"),
  cert: fs.readFileSync(keysDir + "/certificate.pem")
};

var httpsServer = https.createServer(options, app).listen(appEnv.port, function(){
  logger.info("Sauce Labs broker started at:" + appEnv.url);
});

module.exports = app;
