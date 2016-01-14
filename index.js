/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2015. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
 
var cfenv = require("cfenv"),
    express = require("express"),
    log4js = require("log4js"),
    bodyParser = require("body-parser"),
    routes = require("./routes"),
    config = require("./util/config"),
    appEnv = cfenv.getAppEnv(),
    app = express();

//configure logging
log4js.configure(process.env.LOG4JS_CONFIG || "./assets/log4js.json", {
	reloadSecs: 30
});
var requestLogger = log4js.connectLogger(log4js.getLogger("request"), { format: ":method :url :status - :response-time ms" });

var logger = log4js.getLogger("server");

app.use(bodyParser.json());
app.use(requestLogger);
app.use(function (req, res, next) {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.status(501).send('https required');
  }
  next();
});
app.use(config.contextRoot + config.contextPath + '/', routes.index);
app.use(config.contextRoot + '/status', routes.status);
app.use(config.contextRoot + '/version', routes.version);

app.listen(appEnv.port, function () {
    logger.info("Server starting on: " + appEnv.url);
});

module.exports = app;
