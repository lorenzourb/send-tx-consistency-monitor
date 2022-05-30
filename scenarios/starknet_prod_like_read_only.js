import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check, sleep } from 'k6';
import { Rate } from "k6/metrics";

const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('../rpc_jsons/rpcs_starknet_mainnet.json'));
});

export const options = {
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 200,
      duration: '3m',
      preAllocatedVUs: 200,
      maxVUs: 300,
    },
  }
};

export let infuraErrorRate = new Rate("InfuraErrors");

export default function () {
  group('Infura - Starknet - Production like traffic (read only)', function () {
    const url = `https://starknet-mainnet.dev.infura.org/v3/27b3b233553a4b95bf08db32b26ae581`;
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
      console.log(JSON.stringify(res));
      infuraErrorRate.add(1);
    }    
  });
}