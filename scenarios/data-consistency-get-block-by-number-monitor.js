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
export let blockByNumberErrorRateInfura = new Counter('Block By Number Errors Infura');
export let blockByNumberErrorRateAlchemy = new Counter('Block By Number Errors Alchemy');
export let ethCallErrorRateInfura = new Counter('EthCall Errors Infura');
export let ethCallErrorRateAlchemy = new Counter('EthCall Errors Alchemy');
export let ethCallNotMatchingBlockErrorRateInfura = new Counter('EthCall NotMatchingBlock Errors Infura');
export let ethCallNotMatchingBlockErrorRateAlchemy = new Counter('EthCall NotMatchingBlock Errors Alchemy');
export let passRateInfura = new Counter('Pass blockByNumber Infura');
export let passRateAlchemy = new Counter('Pass blockByNumber Alchemy');

export const payload = JSON.stringify({
  id: 1,
  jsonrpc: '2.0',
  params: [],
  method: 'eth_blockNumber',
});
export const payloadBlockByNumber = blockNumber =>
  JSON.stringify({
    id: 1,
    jsonrpc: '2.0',
    params: [`${blockNumber}`,false],
    method: 'eth_getBlockByNumber',
});
export const payloadCall = () =>
  JSON.stringify({
    id: 1,
    jsonrpc: '2.0',
    params: [
      {
        "to": "0x01431a0cd7D9b473d8f993008b831f5f1008B481", 
        "data": "0x9663f88f"
      }, "latest"],
    method: 'eth_call',
});

export const params = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: '60s',
};

export default function () {
  group('Data consistency GetBlockByNumber - Infura', function () {
    const url = `https://goerli.infura.io/v3/${__ENV.INFURA_ID}`;
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
      return;
    }
    const responses = http.batch([
      ['POST', url, payloadBlockByNumber(JSON.parse(res.body).result), params],
      ['POST', url, payloadCall(), params],
    ]);
    let success2 = check(responses[0], {
      'eth_getBlockByNumber call check Infura': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        JSON.parse(r.body).result.number &&
        parseInt(JSON.parse(r.body).result.number, 16) > 0
    });
     
    if (!success2) {
      blockByNumberErrorRateInfura.add(1);
      return;
    }

    let success3 = check(responses[1], {
      'eth_call check Infura': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        parseInt(JSON.parse(r.body).result, 16) > 0 &&
        parseInt(JSON.parse(r.body).result, 16) === parseInt(JSON.parse(responses[0].body).result.number, 16)
    });
    if (!success3) {
      if(JSON.parse(responses[1].body).result &&
      parseInt(JSON.parse(responses[1].body).result, 16) > 0 &&
      parseInt(JSON.parse(responses[1].body).result, 16) !== parseInt(JSON.parse(responses[0].body).result.number, 16)){
        ethCallNotMatchingBlockErrorRateInfura.add(1)
      }else{
        ethCallErrorRateInfura.add(1);
      }
      return;
    }
    passRateInfura.add(1);
  });

  group('Data consistency GetBlockByNumber - Alchemy', function () {
    const url = `https://eth-goerli.g.alchemy.com/v2/${__ENV.ALCHEMY_ID}`;
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
      return;
    }
    const res2 = http.post(url, payloadBlockByNumber(JSON.parse(res.body).result), params);
    let success2 = check(res2, {
      'eth_getBlockByNumber call check Alchemy': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        JSON.parse(r.body).result.number &&
        parseInt(JSON.parse(r.body).result.number, 16) > 0
    });
     
    if (!success2) {
      blockByNumberErrorRateAlchemy.add(1);
      return;
    }
    const res3 = http.post(url, payloadCall(), params);
    let success3 = check(res3, {
      'eth_call check Alchemy': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        parseInt(JSON.parse(r.body).result, 16) > 0 &&
        parseInt(JSON.parse(r.body).result, 16) === parseInt(JSON.parse(res2.body).result.number, 16)
    });
    if (!success3) {
      if(JSON.parse(res3.body).result &&
      parseInt(JSON.parse(res3.body).result, 16) > 0 &&
      parseInt(JSON.parse(res3.body).result, 16) !== parseInt(JSON.parse(res2.body).result.number, 16)){
        ethCallNotMatchingBlockErrorRateAlchemy.add(1)
      }else{
        ethCallErrorRateAlchemy.add(1);
      }
      return;
    }
    passRateAlchemy.add(1);
  });

}