#!/bin/sh
set -e

NS=${K6_NS:-harmony}
POD=${K6_POD:-k6-worker-0}
INFLUXDB=http://influxdb-service:8086/myk6db

RUN=true
STOP=false
TEAR=false
INIT=false

while getopts "RSTI" option; do
  case ${option} in
  R) RUN=true ;;
  S) STOP=true ;;
  T) TEAR=true ;;
  I) INIT=true ;;
  *) echo "
K6 test
Option:      Help:
-R           Run test
-S           Stop test
-I           Init setup
-T           Tear down
"
  exit 0
  ;;
  esac
done

if [ "$TEAR" == "true" ]; then
  kubectl -n $NS delete -f stack      
  kubectl -n $NS delete -f k6.worker.yaml
  exit 0
fi

if [ "$STOP" == "true" ]; then
  kubectl -n $NS delete -f k6.worker.yaml
  exit 0
fi

if [ "$INIT" == "true" ]; then
  kubectl -n $NS apply -f stack      
  kubectl -n $NS apply -f k6.worker.yaml
  exit 0
fi

if [ "$RUN" == "true" ]; then
  #tar -C ../ -X ../.gitignore -cpzf - . | kubectl exec -n $NS -i $POD -- tar -xpzf - .;
  tar -C ../ -cpzf - . | kubectl exec -n $NS -i $POD -- tar -xpzf - .;

  kubectl exec -n $NS -i $POD  -- /bin/sh -c "date && \
        echo Starting... && \
          K6_INFLUXDB_PUSH_INTERVAL=2s k6 run scenarios/harmony_kpi.js -e env=dev_0 \
          --out influxdb=$INFLUXDB && \
        echo Finished..."
fi

