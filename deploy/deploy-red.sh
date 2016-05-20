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
cf push "$RED" -i "${NUM_INSTANCES:-1}" -d "$DOMAIN" -m 1G --no-route --no-start

# set the otc broker secret
cf set-env "$RED" OTC_API_BROKER_SECRET "$OTC_API_BROKER_SECRET"
cf set-env "$RED" NEW_RELIC_LICENSE_KEY "$NEW_RELIC_LICENSE_KEY"
cf set-env "$RED" NEW_RELIC_APP_NAME "$NEW_RELIC_APP_NAME"
cf set-env "$RED" CLOUDANT_URL "$CLOUDANT_URL"
cf set-env "$RED" CLOUDANT_PASSWORD "$CLOUDANT_PASSWORD"
cf set-env "$RED" CLOUDANT_USERNAME "$CLOUDANT_USERNAME"
cf set-env "$RED" SECGRP "$SECGRP"

cf set-env "$RED" log4js_syslog_appender_enabled "$LOG4JS_SYSLOG_APPENDER_ENABLED"
cf set-env "$RED" log4js_syslog_appender_host "$LOG4JS_SYSLOG_APPENDER_HOST"
cf set-env "$RED" log4js_syslog_appender_port "$LOG4JS_SYSLOG_APPENDER_PORT"
cf set-env "$RED" log4js_syslog_appender_certificatePath "$LOG4JS_SYSLOG_APPENDER_CERTIFICATEPATH"
cf set-env "$RED" log4js_syslog_appender_privateKeyPath "$LOG4JS_SYSLOG_APPENDER_PRIVATEKEYPATH"
cf set-env "$RED" log4js_syslog_appender_caPath "$LOG4JS_SYSLOG_APPENDER_CAPATH"
cf set-env "$RED" log4js_syslog_appender_product "$LOG4JS_SYSLOG_APPENDER_PRODUCT"


cf set-env "$RED" LOCAL_KEY "$LOCAL_KEY"

# add a red route for testing
cf map-route "$RED" "$DOMAIN" -n "$RED"

# restart app
cf restart "$RED"

