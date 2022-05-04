import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Rate } from "k6/metrics";

const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('./rpcs_aurora_testnet.json'));
});

export const options = {
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 200,
      duration: '5m',
      preAllocatedVUs: 200,
      maxVUs: 200,
    },
  }
};

// export const options = {
//   scenarios: {
//     contacts: {
//       executor: 'constant-arrival-rate',
//       rate: 300,
//       duration: '5m',
//       preAllocatedVUs: 150,
//       maxVUs: 300,
//     },
//   }
// };

export let infuraErrorRate = new Rate("InfuraErrors");

export default function () {
  group('Infura - Aurora - Production like traffic', function () {
    const url = `https://aurora-testnet.infura.io/v3/`;
    const payload = JSON.stringify(data[Math.floor(Math.random() * data.length)]);
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
        r.body.includes('"jsonrpc":"2.0"'),
      'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) { 
      console.log(payload);
      infuraErrorRate.add(1);
    } 
  });
}
