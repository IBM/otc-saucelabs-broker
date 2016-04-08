/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

var config = require("../config/config.json"),
	cfenv = require("cfenv");

module.exports = {
	env: process.env.APPLICATION_ENV || config.env,

	contextRoot: process.env.CONTEXT_ROOT || config.contextRoot,
	contextPath: process.env.CONTEXT_PATH || config.contextPath,
	buildNumber: process.env.BUILD_NUMBER,
	dashboardUrl: process.env.DASHBOARD_URL || config.dashboardUrl,

   	otc_api_broker_id: process.env.OTC_API_BROKER_ID || config.otc_api_broker_id,
    otc_api_broker_secret: process.env.OTC_API_BROKER_SECRET || config.otc_api_broker_secret,

    cloudant_url: process.env.CLOUDANT_URL || cfenv.getAppEnv().getServiceURL("otc-saucelabs-db") || config.cloudant_url,
    cloudant_database: process.env.CLOUDANT_DATABASE || config.cloudant_database
};
