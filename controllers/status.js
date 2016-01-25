/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

var database = require("../util/database");

module.exports = function(req, res, next) {
    switch(req.method) {
    case "GET":
    	if (database.isOk()){
    		database.validateRead(function(ok, msg){
    			if (ok){
    				res.status(200).send({});
    			} else{
    				res.status(500).send({description:msg});
    			}
    		});
    	} else {
    		res.status(500).send({description:"Failed to connect to the database"});
    	}
        break;
    default:
        res.status(405).json({description: "HTTP 405 - " + req.method + " not allowed for this path"});
    }
};