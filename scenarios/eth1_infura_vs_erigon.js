import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Rate } from "k6/metrics";

// not using SharedArray here will mean that the code in the function call (that is what loads and
// parses the json) will be executed per each VU which also means that there will be a complete copy
// per each VU
const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('../rpc_jsons/rpcs_eth1.json'));
});

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '2m',
      preAllocatedVUs: 500, // how large the initial pool of VUs would be
      maxVUs: 5000, // if the preAllocatedVUs are not enough, we can initialize more
    },
  },
  // stages: [
  //   { duration: '1m', target: 800 }, // normal load
  //   { duration: '1m', target: 800 },
  //   { duration: '1m', target: 1600 }, // around the breaking point
  //   { duration: '2m', target: 1600 },
  //   // { duration: '1m', target: 800 }, // beyond the breaking point
  //   { duration: '1m', target: 0 }, // scale down. Recovery stage.
  // ]
};

export let infuraErrorRate = new Rate("InfuraErrors");
export let erigonErrorRate = new Rate("ErigonErrors");

export default function () {
  // group('Infura - Eth1 - Mainnet', function () {
  //   const url = `http://ec2-52-23-201-192.compute-1.amazonaws.com:8545`;
  //   // const url = `https://mainnet.infura.io/v3/${__ENV.INFURA_KEY}`;
  //   const payload = JSON.stringify(data[Math.floor(Math.random() * data.length)]);
  //   const params = {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     timeout: '120s'
  //   };
  //   const res = http.post(url, payload, params);
  //   let success = check(res, {
  //     'is status 200': (r) => r.status === 200,
  //     'verify rpc resp': (r) =>
  //       r.body.includes('"jsonrpc":"2.0"'),
  //     'verify rpc resp - no err': (r) =>
  //       !r.body.includes('error')
  //   });
  //   if(!success) { 
  //     console.log(url);
  //     console.log(payload);
  //     infuraErrorRate.add(1);
  //   }
  // });

  group('Erigon - Eth1 - Mainnet', function () {
    // const url = `http://internal-k8s-miketest-erigonrp-8bef4c574c-1464932306.us-east-1.elb.amazonaws.com`
    const url = `http://34.229.187.1:8545`;
    // const url = `http://54.82.108.149:8545`;
    const payload = JSON.stringify(data[Math.floor(Math.random() * data.length)])
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s'
    }
    const res = http.post(url, payload, params)
    // console.log(JSON.stringify(res))
    let success = check(res, {
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
      r.body && r.body.includes('"jsonrpc":"2.0"'),
      'verify rpc resp - no err': (r) =>
      r.body && !r.body.includes('error')
    })
    if(!success) { 
      console.log(url);
      console.log(payload);
      erigonErrorRate.add(1);
    }
  })
}