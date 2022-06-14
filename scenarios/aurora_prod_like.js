import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Rate } from "k6/metrics";

const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('../rpc_jsons/rpcs_aurora_mainnet.json'));
});

export const options = {
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 500,
      duration: '5m',
      preAllocatedVUs: 700,
      maxVUs: 700,
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
    const url = `https://aurora-mainnet.dev.infura.org/v3/${__ENV.INFURA_KEY}`;
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
