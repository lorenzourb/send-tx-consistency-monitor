import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Rate } from 'k6/metrics';

// not using SharedArray here will mean that the code in the function call (that is what loads and
// parses the json) will be executed per each VU which also means that there will be a complete copy
// per each VU
const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('../rpc_jsons/rpcs_blockNumber.json'));
});

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 15,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '24h',
      preAllocatedVUs: 100, // how large the initial pool of VUs would be
      maxVUs: 100, // if the preAllocatedVUs are not enough, we can initialize more
    },
  }
};

export let blockNumberIncreaseErrorRate = new Rate('Block Number Increase Errors');
// export let erigonErrorRate = new Rate("ErigonErrors");

export let blockNumber;

export default function () {
  group('Data consistency blockNumber increase', function () {
    const url = `https://mainnet.infura.io/v3/b62f751572534b40884d6e18c291fc07`;
    // const url = `https://mainnet.infura.io/v3/${__ENV.INFURA_KEY}`;
    const payload = JSON.stringify(data[Math.floor(Math.random() * data.length)]);
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s',
    };
    const res = http.post(url, payload, params);
    blockNumber =
      (blockNumber === 0 && res.body && res.body.result)
        ? parseInt(JSON.parse(res.body).result, 16)
        : 0;
    let success = check(res, {
      'is status 200': r => r.status === 200,
      'verify rpc resp': r => r.body.includes('"jsonrpc":"2.0"'),
      'verify rpc resp - no err': r => !r.body.includes('error'),
      'block increase check': r => 
        parseInt(JSON.parse(r.body).result, 16) - blockNumber == 1  ||  parseInt(JSON.parse(r.body).result, 16) - blockNumber == 0 
    });
    if (!success) {
      // console.log(res.status === 200);
      // console.log(res.body.includes('"jsonrpc":"2.0"'));
      // console.log(!res.body.includes('error'));
      console.log(blockNumber);
      console.log(parseInt(JSON.parse(res.body).result, 16));
      console.log(parseInt(JSON.parse(res.body).result, 16) >= blockNumber);
      blockNumberIncreaseErrorRate.add(1);
    } else {
      blockNumber = parseInt(JSON.parse(res.body).result, 16);
    }
  });
}
