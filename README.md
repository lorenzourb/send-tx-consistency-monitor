# Initial Setup (MAC)
* install/update brew `brew update`
* Install k6 globally `brew install k6`
* Install & run Influxdb  `docker run -d influxdb \
 --p 8086:8086 \
-v influxdb:/var/lib/influxdb \
influxdb:1.8`
* Install grafana `brew install grafana && brew services start grafana`
* Go to the grafana UI `http://localhost:3000` and after the login configure Influx db as a data source then import the following dashboards by ID `https://grafana.com/grafana/dashboards/13719`
* Review the test RPC fixture mix 
* Into `main.js` review the test scenario and group configuration
* Run a test with `k6 run -e INFURA_KEY=put_your_infura_key_here ALCHEMY_KEY=put_your_alchemy_key_here main.js --out influxdb=http://localhost:8086/myk6db` making sure to point the correct account keys

