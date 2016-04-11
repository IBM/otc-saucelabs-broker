NAME
----

OTC Saucelabs Broker

This broker is an implementation of an OTC Service Broker.

Logging
-------

Logging is handled using log4js.

To configure the logging levels and output location, modify the config/log4js.json file.


USAGE
-----

	# Implemented Endpoints
	GET /version
		Version info including build time and git info
	GET /status
		Up status (server up and database read check)
	PUT /saucelabs-broker/api/v1/service_instances/:sid
		Creates or updates the service instance.
	PATCH /saucelabs-broker/api/v1/service_instances/:sid
		Patches the service instance.
	PUT /saucelabs-broker/api/v1/service_instances/:sid/toolchains/:tid
		Binds the service instance to a toolchain.
	DELETE /saucelabs-broker/api/v1/service_instances/:sid
		Deletes the service instance.
	DELETE /saucelabs-broker/api/v1/service_instances/:sid/toolchains
		Removes all toolchains associated with the service instance.
	DELETE /saucelabs-broker/api/v1/service_instances/:sid/toolchains/:tid
		Removes the toolchain associated with the service instance.


LOCAL USAGE
-----------

	# Grab the code.

	git clone https://github.ibm.com/org-ids/otc-saucelabs-broker.git
	cd otc-saucelabs-broker

	On the command line, run:

	export OTC_API_BROKER_SECRET="<otc api broker secret>"
	export CLOUDANT_URL="https://<account name>:<password>@<account name>.cloudant.com"
	export CLOUDANT_DATABASE="<a database name>"

	Install the module dependencies by running npm install.
	Start the node app by running npm start.

RUNNING TESTS
-------------

	build_info.json

	This file is required for test. You can create it by running ./version.sh or
	saving the json on the /version route on the server you want to test

	Install the dev dependencies

	Running up tests

	On the command line, run:

	node test/up

	Running API test

	New shell, on the command line, run:
	export TEST_URL="<base url to the broker>" (local example http://localhost:6001)
	export SAUCELABS_USERNAME="<your saucelabs username>"
	export SAUCELABS_KEY="<your saucelabs key>"
	export ORGANIZATION_GUID="<a valid org id for TEST_USER>"
	export TEST_USER="<test username>"
	export TEST_PASSWORD="<test username password>"

	From the repository top dir, run

	node test/api

	and for some reporting:

	node test/api.js | node_modules/tap-xunit/bin/tap-xunit > report.xml