#!/bin/sh
set -e

NS=${K6_NS:-qa-k6}
TEST=${K6_TEST:-scenarios/data-consistency-monitor.js}
POD=${K6_POD:-k6-worker-0}
INFLUXDB=http://influxdb-service:8086/myk6db
PROMETHEUS=http://prometheus-service:9090/api/v1/write 

RUN=true
STOP=false
TEAR=false
INIT=false
UPDATE=false
FLUXDB=true

while getopts "RSTIU" option; do
  case ${option} in
  R) RUN=true ;;
  S) STOP=true ;;
  T) TEAR=true ;;
  I) INIT=true ;;
  U) UPDATE=true ;;
  F) FLUXDB=true ;;
  *) echo "
K6 test
Option:      Help:
-R           Run test
-S           Stop test
-I           Init setup
-U           Update setup
-T           Tear down
"
  exit 0
  ;;
  esac
done

template=`cat rbac.prometheus.template | sed "s/{{NAMESPACE}}/$NS/g"`

if [ "$TEAR" == "true" ]; then
  kubectl -n $NS delete -f stack

  echo "$template" | kubectl -n $NS delete -f -

  kubectl -n $NS delete -f k6.worker.yaml
  exit 0
fi

if [ "$STOP" == "true" ]; then
  kubectl -n $NS delete -f k6.worker.yaml
  exit 0
fi

if [ "$INIT" == "true" ] || [ "$UPDATE" == "true" ] ; then
  kubectl -n $NS apply -f stack

  echo "$template" | kubectl -n $NS apply -f -

  kubectl -n $NS apply -f k6.worker.yaml
  exit 0
fi

ENV=k8s_s1

if [ "$RUN" == "true" ]; then
  #tar -C ../ -X ../.gitignore -cpzf - . | kubectl exec -n $NS -i $POD -- tar -xpzf - .;
  tar -C ../ -cpzf - . | kubectl exec -n $NS -i $POD -- tar -xpzf - .;

  if [ "$FLUXDB" == "true" ]; then 
    kubectl exec -n $NS -i $POD  -- /bin/sh -c "date && \
          echo Starting... && \
            K6_INFLUXDB_PUSH_INTERVAL=2s k6 run --out influxdb=$INFLUXDB $TEST -e env=$ENV "
  else
    kubectl exec -n $NS -i $POD  -- /bin/sh -c "date && \
          echo Starting... && \
           K6_PROMETHEUS_REMOTE_URL=$PROMETHEUS k6 run $TEST -e env=$ENV \
           -o output-prometheus-remote && \
          echo Finished..."

  fi
fi

