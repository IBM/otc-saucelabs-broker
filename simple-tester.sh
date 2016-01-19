
URL=https://otc-saucelabs-broker.stage1.ng.bluemix.net

curl -k $URL/status

curl -k $URL/version

curl -k -i -X PUT -d'{}' $URL/saucelabs-broker/api/v1/service_instances/123

curl -k -i -X PUT -d'{}' $URL/saucelabs-broker/api/v1/service_instances/123/toolchains/3434

curl -k -i -X DELETE $URL/saucelabs-broker/api/v1/service_instances/123/toolchains/3434

curl -k -i -X DELETE $URL/saucelabs-broker/api/v1/service_instances/123


