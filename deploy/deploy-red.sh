#!/bin/bash -x

###############################################################################
# Licensed Materials - Property of IBM
# (c) Copyright IBM Corporation 2015, 2016. All Rights Reserved.
#
# Note to U.S. Government Users Restricted Rights:
# Use, duplication or disclosure restricted by GSA ADP Schedule
# Contract with IBM Corp.
###############################################################################


RED=${CF_APP}-red

# push the app
cf push "$RED" -d "$DOMAIN" -m 1G --no-route --no-start

# set the tiam client secret
cf set-env "$RED" TIAM_CLIENT_SECRET "$TIAM_CLIENT_SECRET"

# bind the cloudant service instance
# this will make the url, with credentials, show up as
# part of the VCAP environment variables
cf bind-service "$RED" "$CLOUDANT_SERVICE_NAME"

# add a red route for testing
cf map-route "$RED" "$DOMAIN" -n "$RED"

# restart app
cf restart "$RED"

