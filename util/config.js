/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

var config = require("../config/config.json");

module.exports = {
	httpsPort: process.env.HTTPS_PORT || config.httpsPort,
	contextRoot: process.env.CONTEXT_ROOT || config.contextRoot,
	contextPath: process.env.CONTEXT_PATH || config.contextPath,
	buildNumber: process.env.BUILD_NUMBER,
	dashboardUrl: config.dashboardUrl
};
