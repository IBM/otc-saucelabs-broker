/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

var catalog = require("../assets/catalog.json");

module.exports = function(req, res, next) {

    switch(req.method) {
	    case "GET":
	        res.status(200).json(catalog);
	        break;
	    default:
	        res.status(405).json({description: "HTTP 405 - " + req.method + " not allowed for this path"});
    }
};