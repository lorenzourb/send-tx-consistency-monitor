import http from 'k6/http';
import { group, check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '3600h',
      preAllocatedVUs: 100, // how large the initial pool of VUs would be
      maxVUs: 100, // if the preAllocatedVUs are not enough, we can initialize more
    },
  },
};

export let blockNumberErrorRateInfura = new Counter('Block Number Errors Infura');
export let blockNumberErrorRateAlchemy = new Counter('Block Number Errors Alchemy');
export let logsErrorRateInfura = new Counter('Logs Errors Infura');
export let logsErrorRateAlchemy = new Counter('Logs Errors Alchemy');

export let passRateInfura = new Counter('Pass Infura');
export let passRateAlchemy = new Counter('Pass Alchemy');

export const payload = JSON.stringify({
  id: 1,
  jsonrpc: '2.0',
  params: [],
  method: 'eth_blockNumber',
});
export const payloadLogs = block =>
  JSON.stringify({
    id: 1,
    jsonrpc: '2.0',
    params: [
      {
        fromBlock: `${block}`,
      },
    ],
    method: 'eth_getLogs',
  });

export const params = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: '60s',
};

export default function () {
  group('Data consistency blockNumber/Logs increase - Infura', function () {
    const url = `https://mainnet.infura.io/v3/${__ENV.INFURA_ID}`;
    const res = http.post(url, payload, params);

    let success = check(res, {
      'block number call check Infura': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        parseInt(JSON.parse(r.body).result, 16) > 0,
    });
    if (!success) {
      blockNumberErrorRateInfura.add(1);
      // console.log(res.status);
      // console.log(JSON.parse(res.body));
      return;
    }
    
    const res2 = http.post(url, payloadLogs(JSON.parse(res.body).result), params);
    let success2 = check(res2, {
      'log call check Infura': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        JSON.parse(r.body).result.length > 0 &&
        JSON.parse(res2.body).result[0].blockNumber &&
        JSON.parse(res2.body).result[0].blockNumber === JSON.parse(res.body).result,
    });

    if (!success2) {
      logsErrorRateInfura.add(1);
      // console.log(res2.status);
      // console.log(JSON.parse(res.body).result);
      // console.log(JSON.parse(res2.body));
      return;
    }
    passRateInfura.add(1);
  });

  group('Data consistency blockNumber/Logs increase - Alchemy', function () {
    const url = `https://eth-mainnet.g.alchemy.com/v2/${__ENV.ALCHEMY_ID}`;
    const res = http.post(url, payload, params);

    let success = check(res, {
      'block number call check Alchemy': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        parseInt(JSON.parse(r.body).result, 16) > 0,
    });
    if (!success) {
      blockNumberErrorRateAlchemy.add(1);
      // console.log(res.status);
      // console.log(JSON.parse(res.body));
      return;
    }

    const res2 = http.post(url, payloadLogs(JSON.parse(res.body).result), params);
    let success2 = check(res2, {
      'log call check Alchemy': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        JSON.parse(r.body).result.length > 0 &&
        JSON.parse(res2.body).result[0].blockNumber &&
        JSON.parse(res2.body).result[0].blockNumber === JSON.parse(res.body).result,
    });

    if (!success2) {
      logsErrorRateAlchemy.add(1);
      // console.log(res2.status);
      // console.log(JSON.parse(res.body).result);
      // console.log(JSON.parse(res2.body));
      return;
    }
    passRateAlchemy.add(1);
  });

}