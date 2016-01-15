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
 //   https = require("https"),
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

router
  .use(bodyParser.json())
  .use(requestLogger)
  .all("/status", status) // status and version at root
  .all("/version", version)
  .use(config.contextRoot + config.contextPath + '/service_instances', service_instances);

app  
  .use(function (req, res, next) {
    // If a request comes in that appears to be http, reject it.
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      return res.status(501).send('https required');
    }
    next();
  })
  .use(router)
  .listen(appEnv.port, function () {
    logger.info("Sauce Labs broker starting on: " + appEnv.url);
  });

// var keysDir = "keys";
// var options = {
//   key: fs.readFileSync(keysDir + "/privatekey.pem"),
//   cert: fs.readFileSync(keysDir + "/certificate.pem")
// };

// var httpsServer = https.createServer(options, app).listen(appEnv.port, function(){
//   logger.info("Sauce Labs broker started at:" + appEnv.url);
// });

//module.exports = app;
