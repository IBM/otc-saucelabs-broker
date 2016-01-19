# remove the line .use(fetchAuthMiddleware()) in index.js before trying to run this

URL=https://otc-saucelabs-broker.stage1.ng.bluemix.net
#URL=http://127.0.0.1:6001

curl -k $URL/status

curl -k $URL/version

curl -k -i -H "Content-Type: application/json" -X PUT -d @create.json $URL/saucelabs-broker/api/v1/service_instances/123

curl -k -i -H "Content-Type: application/json" -X PUT -d @update.json $URL/saucelabs-broker/api/v1/service_instances/123

curl -k -i -X PUT -d'{}' $URL/saucelabs-broker/api/v1/service_instances/123/toolchains/3434

curl -k -i -X PATCH -d @patch.json $URL/saucelabs-broker/api/v1/service_instances/123

curl -k -i -X PATCH -d @patch2.json $URL/saucelabs-broker/api/v1/service_instances/123/toolchains/3434

curl -k -i -X DELETE $URL/saucelabs-broker/api/v1/service_instances/123/toolchains/3434

curl -k -i -X DELETE $URL/saucelabs-broker/api/v1/service_instances/123


