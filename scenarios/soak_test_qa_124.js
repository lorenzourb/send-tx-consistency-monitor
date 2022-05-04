import http from 'k6/http';
// import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Counter } from 'k6/metrics';
import { Rate } from "k6/metrics";

const url = `https://polygon-mainnet.infura.io/v3/06c059d611c641ffac588230c08f2e6c`;
const url2 = `https://mainnet.infura.io/v3/06c059d611c641ffac588230c08f2e6c`;

// const data = new SharedArray('Rpcs', function (){
//   return JSON.parse(open('./ethgetlogs.json'));
// });

export const options = {
  scenarios: {
    contacts: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      preAllocatedVUs: 50,
      maxVUs: 100,
      timeUnit: '2s',
      stages: [
        { target: 1, duration: '1h' }
      ],
    }
  }
};

export let getBlockPolErrorRate = new Rate("getBlockPolygonErrorRate");
const myCounter1 = new Counter('getBlockPolygonCount');
export let blockByNumberPolErrorRate = new Rate("blockByNumberPolygonErrorRate");
const myCounter2 = new Counter('blockByNumberPolygonCount');
export let getLogsPolErrorRate = new Rate("getLogsPolygonErrorRate");
const myCounter3 = new Counter('getLogsPolygonCount');
export let getBlockEthErrorRate = new Rate("getBlockEthErrorRate");
const myCounter4 = new Counter('getBlockEthCount');
export let blockByNumberEthErrorRate = new Rate("blockByNumberEthErrorRate");
const myCounter5 = new Counter('blockByNumberEthCount');
export let getLogsEthErrorRate = new Rate("getLogsEthErrorRate");
const myCounter6 = new Counter('getLogsEthCount');

export default function () {
  group("QA-124 - Soak test - GetBlockByNumber - Polygon", function () {
    const payload = JSON.stringify({"id":1,"jsonrpc":"2.0","params":[],"method":"eth_blockNumber"})
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s'
    };
    let res = http.post(url, payload, params);
    myCounter1.add(1)
    const block = JSON.parse(res.body) && JSON.parse(res.body).result ? JSON.parse(res.body).result : undefined
    let success = check(res, {
      'block number returned': block,
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
        'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) {
      // console.log(res.body);
      getBlockPolErrorRate.add(1);
    }

    const payload2 = JSON.stringify({"jsonrpc":"2.0","id":6418,"method":"eth_getBlockByNumber","params":[block,false]})
    res = http.post(url, payload2, params);
    myCounter2.add(1)
    const number = JSON.parse(res.body) && JSON.parse(res.body).result && JSON.parse(res.body).result ? JSON.parse(res.body).result.number : undefined
    success = check(res, {
      'block by number ok': number === block,
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
        'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) {
      // console.log(res.body);
      blockByNumberPolErrorRate.add(1);
    }
  });

  group("QA-124 - Soak test - GetLogs - Polygon", function () {
    const payload = JSON.stringify({"id":1,"jsonrpc":"2.0","params":[],"method":"eth_blockNumber"})
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s'
    };
    let res = http.post(url, payload, params);
    myCounter1.add(1)
    const block = JSON.parse(res.body) && JSON.parse(res.body).result ? JSON.parse(res.body).result : undefined
    let success = check(res, {
      'block number returned': block,
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
        'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) {
      // console.log(res.body);
      getBlockPolErrorRate.add(1);
    }
    const payload2 = JSON.stringify({"jsonrpc":"2.0","id":6182153,"method":"eth_getLogs","params":[{"fromBlock":block,"toBlock":"latest"}]},)
    res = http.post(url, payload2, params);
    myCounter3.add(1)
    // console.log(res.body)
    const blockNumber = JSON.parse(res.body) &&  JSON.parse(res.body).result && JSON.parse(res.body).result[0] && JSON.parse(res.body).result[0].blockNumber ? JSON.parse(res.body).result[0].blockNumber : undefined 
    success = check(res, {
      'get log ok': blockNumber === block,
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
        'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) {
      // console.log(JSON.parse(res.body).jsonrpc);
      getLogsPolErrorRate.add(1);
    }
  });

  group("QA-124 - Soak test - GetBlockByNumber - Eth", function () {
    const payload = JSON.stringify({"id":1,"jsonrpc":"2.0","params":[],"method":"eth_blockNumber"})
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s'
    };
    let res = http.post(url2, payload, params);
    myCounter4.add(1)
    const block = JSON.parse(res.body) && JSON.parse(res.body).result ? JSON.parse(res.body).result : undefined
    let success = check(res, {
      'block number returned': block,
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
        'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) {
      // console.log(res.body);
      getBlockEthErrorRate.add(1);
    }

    const payload2 = JSON.stringify({"jsonrpc":"2.0","id":6418,"method":"eth_getBlockByNumber","params":[block,false]})
    myCounter5.add(1)
    res = http.post(url2, payload2, params);
    const number = JSON.parse(res.body) && JSON.parse(res.body).result && JSON.parse(res.body).result ? JSON.parse(res.body).result.number : undefined
    success = check(res, {
      'block by number ok': number === block,
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
        'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) {
      // console.log(res.body);
      blockByNumberEthErrorRate.add(1);
    }
  });

  group("QA-124 - Soak test - GetLogs - Eth", function () {
    const payload = JSON.stringify({"id":1,"jsonrpc":"2.0","params":[],"method":"eth_blockNumber"})
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s'
    };
    let res = http.post(url2, payload, params);
    myCounter4.add(1)
    const block = JSON.parse(res.body) && JSON.parse(res.body).result ? JSON.parse(res.body).result : undefined
    let success = check(res, {
      'block number returned': block,
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
        'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) {
      // console.log(res.body);
      getBlockEthErrorRate.add(1);
    }
    const payload2 = JSON.stringify({"jsonrpc":"2.0","id":6182153,"method":"eth_getLogs","params":[{"fromBlock":block,"toBlock":"latest"}]},)
    res = http.post(url2, payload2, params);
    myCounter6.add(1)
    // console.log(res.body)
    const blockNumber = JSON.parse(res.body) &&  JSON.parse(res.body).result && JSON.parse(res.body).result[0] && JSON.parse(res.body).result[0].blockNumber ? JSON.parse(res.body).result[0].blockNumber : undefined 
    success = check(res, {
      'get log ok': blockNumber === block,
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
        'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) {
      // console.log(JSON.parse(res.body).jsonrpc);
      getLogsEthErrorRate.add(1);
    }
  });

}