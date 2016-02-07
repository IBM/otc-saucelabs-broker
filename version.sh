#!/bin/bash

###############################################################################
# Licensed Materials - Property of IBM
# (c) Copyright IBM Corporation 2015, 2016. All Rights Reserved.
#
# Note to U.S. Government Users Restricted Rights:
# Use, duplication or disclosure restricted by GSA ADP Schedule
# Contract with IBM Corp.
###############################################################################

cat <<END > build_info.json                                       
{                                        
  "time": "$(date +"%Y-%m-%d %H:%M:%S %z")",
  "revision": "$(git rev-parse HEAD)"
}
END
