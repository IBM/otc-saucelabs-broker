/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */

exports.config = {
	app_name: "otc-sauselabs-broker - Local",
	logging: {
	/**
	 * Level at which to log. 'trace' is most useful to New Relic when diagnosing
	 * issues with the agent, 'info' and higher will impose the least overhead on
	 * production applications.
	 */
		level: 'info'
	}
};
