import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// not using SharedArray here will mean that the code in the function call (that is what loads and
// parses the json) will be executed per each VU which also means that there will be a complete copy
// per each VU
const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('../rpc_jsons/rpcs.json'));
});

export const options = {
  vus: 100,
  duration: '3m',
};

export let infuraErrorRate = new Rate('InfuraErrors');
export let alchemyErrorRate = new Rate('AlchemyErrors');

export default function () {
  group('Infura - polygon - Mainnet', function () {
    const url = `https://polygon-mainnet.infura.io/v3/e35433ff37cb4c80aac3bc1afc8c0d08`;
    const payload = JSON.stringify(data[Math.floor(Math.random() * data.length)]);
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s',
    };
    const res = http.post(url, payload, params);
    let success = check(res, {
      'is status 200': r => r.status === 200,
      'verify rpc resp': r => r.body.includes('"jsonrpc":"2.0"'),
      'verify rpc resp - no err': r => !r.body.includes('error'),
    });
    if (!success) {
      console.log(res.body);
      infuraErrorRate.add(1);
    }
  });

  // group('Alchemy - polygon - Mainnet', function () {
  //   const url = `https://polygon-mainnet.g.alchemy.com/v2/-De4IEBCClR6zsgYTUTw-xtESPENGWLk`;
  //   const payload = JSON.stringify(data[Math.floor(Math.random() * data.length)]);
  //   const params = {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     timeout: '120s',
  //   };
  //   const res = http.post(url, payload, params);
  //   let success = check(res, {
  //     'is status 200': r => r.status === 200,
  //     'verify rpc resp': r => r.body.includes('"jsonrpc":"2.0"'),
  //     'verify rpc resp - no err': r => !r.body.includes('error'),
  //   });
  //   if (!success) {
  //     console.log(res.body);
  //     alchemyErrorRate.add(1);
  //   }
  //   sleep(1);
  // });
}
