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

	export TIAM_CLIENT_SECRET="<saucelabs tiam secret>"
	export CLOUDANT_URL="https://<account name>:<password>@<account name>.cloudant.com"
	export CLOUDANT_DATABASE="<a database name>"

	Install the module dependencies by running npm install.
	Start the node app by running npm start.

RUNNING TESTS
-------------

	Work in progress.

	build_info.json

	This file is required for test. You can create it by running ./version.sh or
	saving the json on the /version route on the server you want to test

	Install the dev dependencies

	Running up tests

	On the command line, run:

	node test/up

	Running API test

	New shell, on the command line, run:
	export TEST_URL="<base url to the server>" (local example http://localhost:6001)
	export SAUCELABS_USERNAME="<your saucelabs username>"
	export SAUCELABS_KEY="<your saucelabs key>"
	export BEARER="<a valid bearer token>"

	From the repository top dir, run

	node test/api