#!/bin/bash

cat <<END > build_info.json                                       
{                                        
  "time": "$(date +"%Y-%m-%d %H:%M:%S %z")",
  "revision": "$(git rev-parse HEAD)"
}
END
