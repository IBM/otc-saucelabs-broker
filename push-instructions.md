# Push instructions

To simplify life until we fix the pipeline for this.

* App Name: otc-saucelabs-broker
* Bluemix Org/Space: BluemixDevOpsORG/dev
* Route: otc-saucelabs-broker.stage1.ng.bluemix.net

```
$ cf login -u <username> -p <my pass> -o BluemixDevOpsORG -s dev
$ cf target -s dev
                  
API endpoint:   https://api.stage1.ng.bluemix.net (API version: 2.27.0)
User:           niclas.wretstrom@se.ibm.com
Org:            BluemixDevOpsORG
Space:          dev

$ cf push otc-saucelabs-broker -d stage1.ng.bluemix.net -n otc-saucelabs-broker
```

If you need env vars:
```
$ cf set-env otc-saucelabs-broker <env var name> <value>
$ cf restage otc-saucelabs-broker
```

Logs:
```
$ cf logs otc-saucelabs-broker --recent
```