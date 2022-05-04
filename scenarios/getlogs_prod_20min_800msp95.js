import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check, sleep } from 'k6';
import { Rate } from "k6/metrics";
const data = new SharedArray('Rpcs', function (){
  return JSON.parse(open('./rpcs_palm.json'));
});
export const options = {
  thresholds: {
        // fail the test if 95th percentile response goes above 300ms
        http_req_duration: [{ threshold: 'p(95)<800', abortOnFail: true, delayAbortEval: '30s' }],
      },
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 250,
      duration: '20m',
      preAllocatedVUs: 150,
      maxVUs: 300,
    }
  }
};
export let infuraErrorRate = new Rate("InfuraErrors");
export default function () {
  group("eth getLogs 800ms p95 20 minute test", function () {
    const url = `https://palm-mainnet.infura.io/v3/${__ENV.INFURA_KEY}`;
    const payload = JSON.stringify(data)
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s'
    };
    const res = http.post(url, payload, params);
    let success = check(res, {
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('“jsonrpc”:“2.0"'),
        'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) {
      console.log(res.body);
      infuraErrorRate.add(1);
    }
  });
}