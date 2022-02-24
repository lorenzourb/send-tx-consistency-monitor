import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Rate } from "k6/metrics";

// not using SharedArray here will mean that the code in the function call (that is what loads and
// parses the json) will be executed per each VU which also means that there will be a complete copy
// per each VU
const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('../rpcs_eth1.json'));
});

export const options = {
  vus: 50,
  duration: '2m',
};

export let infuraErrorRate = new Rate("InfuraErrors");
export let erigonErrorRate = new Rate("ErigonErrors");

export default function () {
  group('Infura - Eth1 - Mainnet', function () {
    const url = `https://mainnet.infura.io/v3/${__ENV.INFURA_KEY}`;
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
      console.log(url);
      console.log(payload);
      infuraErrorRate.add(1);
    }
  });

  // group('Erigon - Eth1 - Mainnet', function () {
  //   const url = `http://54.82.108.149:8545`;
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
  //     erigonErrorRate.add(1);
  //   }
  // });

}