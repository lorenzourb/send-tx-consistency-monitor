# Initial Setup (MAC)
* install/update brew `brew update`
* Install k6 globally `brew install k6`
* Install & run Influxdb  `docker run -p 8086:8086 \
      -v influxdb:/var/lib/influxdb \
      influxdb:1.8`
* Install grafana `brew install grafana && brew services start grafana`
* Go to the grafana UI `http://localhost:3000` and after the login configure Influx db as a data source then import the following dashboards by ID `https://grafana.com/grafana/dashboards/13719`
* Review the test RPC fixture mix 
* Into `infura_vs_alchmey.js` review the test scenario and group configuration
* Run a test with `INFURA_KEY=put_your_infura_key_here ALCHEMY_KEY=put_your_alchemy_key_here k6 run main.js --out influxdb=http://localhost:8086/myk6db` making sure to point the correct account keys

# Send metrics to Datadoghq
* Run the agent with the docker command from https://k6.io/docs/results-visualization/datadog/ (make sure to specify the api_key)
* Run the test script with `K6_STATSD_ENABLE_TAGS=true INFURA_KEY=put_your_infura_key_here ALCHEMY_KEY=put_your_alchemy_key_here k6 run --out statsd main.js`


K6_INFLUXDB_PUSH_INTERVAL=2s
K6_INFLUXDB_PAYLOAD_SIZE= K6_INFLUXDB_PUSH_INTERVAL=3s INFURA_KEY='' k6 run scenarios/eth1_infura_vs_erigon.js --out influxdb=http://localhost:8086

# Docker-compose
Docker-compose can be used to provision a local stack of  `grafana`, `influxdb`,`prometheus` and `telegraf`, to ease the testing locally; You can comment off any service if not used.
to spin off influxdb stack:
```
docker-compose up -d
``` 

to run the load testing: e.g. harmony
```
k6 run scenarios/harmony_kpi.js --out influxdb=http://localhost:8086/myk6db
```

## Endpoint
Endpoint can be configured in the `settings.json` and pass through as `env` variables.
to run the load testing using local endpoint:
```
k6 run scenarios/harmony_kpi.js -e env=local  --out influxdb=http://localhost:8086/myk6db
```