import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check, sleep } from 'k6';
import { Rate } from "k6/metrics";
const data = new SharedArray('Rpcs', function (){
  return JSON.parse(open('./ethgetlogs.json'));
});
export const options = {
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 5,
      duration: '20m',
      preAllocatedVUs: 20,
      maxVUs: 40,
    }
  }
};
export let infuraErrorRate = new Rate("InfuraErrors");
export default function () {
  group("eth getLogs 20 minute test", function () {
    const url = `https://mainnet.infura.io/v3/${__ENV.INFURA_KEY}`;
    // sample eth_getLogs from https://github.com/INFURA/evm-log/issues/1
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