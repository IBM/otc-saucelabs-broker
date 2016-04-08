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
GREEN=${CF_APP}-green
GREY=${CF_APP}-grey

# rename current/old app if it exists
unset OLD_APP_EXISTS
if cf app "$GREEN" >/dev/null 2>&1
then
	OLD_APP_EXISTS=true
	cf rename "$GREEN" "$GREY"
fi

# rename new app to green
cf rename "$RED" "$GREEN"

# add the real route to the new app
cf map-route "$GREEN" "$DOMAIN" -n "$CF_APP"

# remove red route from new app
cf unmap-route "$GREEN" "$DOMAIN" -n "$RED"

# restart new app, now green
cf restart "$GREEN"

if [ $OLD_APP_EXISTS ]
then
	# add the red route to the old app
	cf map-route "$GREY" "$DOMAIN" -n "$RED"

	# remove real route from old app
	cf unmap-route "$GREY" "$DOMAIN" -n "$CF_APP"

	# rename old app to red
	cf rename "$GREY" "$RED"

    # stop old app
    cf stop "$RED"
fi