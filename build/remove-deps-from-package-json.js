/**
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 */
/*
 * Usage:
 *
 * Rich man's sed script for safely removing dependencies from package.json.
 * This is necessary in order to have Bluemix forgo npm installs.
 *
 * node remove-deps-from-package-json
 *
 */

"use strict";

var fs = require("fs");
var targetFile = "package.json";

var packageJson = JSON.parse(fs.readFileSync(targetFile));
packageJson.dependencies = {};
fs.writeFileSync(targetFile, JSON.stringify(packageJson, null, 2));
