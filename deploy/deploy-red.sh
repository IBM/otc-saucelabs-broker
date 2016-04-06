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
cf set-env "$RED" OTC_API_BROKER_SECRET "$OTC_API_BROKER_SECRET"
cf set-env "$RED" NEW_RELIC_LICENSE_KEY "$NEW_RELIC_LICENSE_KEY"
cf set-env "$RED" NEW_RELIC_APP_NAME "$NEW_RELIC_APP_NAME"

# bind the cloudant service instance
# this will make the url, with credentials, show up as
# part of the VCAP environment variables
cf bind-service "$RED" "$CLOUDANT_SERVICE_NAME"

# add a red route for testing
cf map-route "$RED" "$DOMAIN" -n "$RED"

# restart app
cf restart "$RED"

