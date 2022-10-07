import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Rate, Gauge } from 'k6/metrics';

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
      rate: 13,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '24h',
      preAllocatedVUs: 100, // how large the initial pool of VUs would be
      maxVUs: 100, // if the preAllocatedVUs are not enough, we can initialize more
    },
  },
};

export let blockNumberIncreaseErrorRateInfura = new Rate('Block Number Increase Errors Infura');
export let blockNumberIncreaseErrorRateAlchemy = new Rate('Block Number Increase Errors Alchemy');
export let blockNumberIncreaseErrorRatePokt = new Rate('Block Number Increase Errors Pokt');
export let blockNumberIncreaseErrorRateQuicknode = new Rate(
  'Block Number Increase Errors Quicknode',
);
export let blockNumberIncreaseErrorRateCoinbase = new Rate('Block Number Increase Errors Coinbase');

export let blockNumberIncreasePassRateInfura = new Rate('Block Number Increase Pass Infura');
export let blockNumberIncreasePassRateAlchemy = new Rate('Block Number Increase Pass Alchemy');
export let blockNumberIncreasePassRatePokt = new Rate('Block Number Increase Pass Pokt');
export let blockNumberIncreasePassRateQuicknode = new Rate('Block Number Increase Pass Quicknode');
export let blockNumberIncreasePassRateCoinbase = new Rate('Block Number Increase Pass Coinbase');

export let blockNumberInfura = 0;
export let blockNumberAlchemy = 0;
export let blockNumberPokt = 0;
export let blockNumberQuicknode = 0;
export let blockNumberCoinbase = 0;

const gaugeInfura = new Gauge('Infura gauge');
const gaugeAlchemy = new Gauge('Alchemy gauge');
const gaugePokt = new Gauge('Pokt gauge');
const gaugeQuicknode = new Gauge('Quicknode gauge');
const gaugeCoinbase = new Gauge('Coinbase gauge');

export const payload = JSON.stringify(data[0]);
export const params = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: '120s',
};

export default function () {
  group('Data consistency blockNumber increase - Infura', function () {
    const url = `https://mainnet.infura.io/v3/`;
    const res = http.post(url, payload, params);

    if (blockNumberInfura === 0 && res.body && JSON.parse(res.body).result) {
      blockNumberInfura = parseInt(JSON.parse(res.body).result, 16);
    }

    let success = check(res, {
      'block increase check Infura': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        parseInt(JSON.parse(r.body).result, 16) > 0 &&
        (parseInt(JSON.parse(r.body).result, 16) - blockNumberInfura == 1 ||
          parseInt(JSON.parse(r.body).result, 16) - blockNumberInfura == 0),
    });
    if (!success) {
      // console.log(res.status === 200);
      // console.log(res.body.includes('"jsonrpc":"2.0"'));
      // console.log(!res.body.includes('error'));
      // console.log(blockNumberInfura);
      // console.log(parseInt(JSON.parse(res.body).result, 16));
      console.log(`dedede: ${parseInt(JSON.parse(res.body).result, 16) - blockNumberInfura}`);
      blockNumberIncreaseErrorRateInfura.add(1);
      gaugeInfura.add(parseInt(JSON.parse(res.body).result, 16) - blockNumberInfura);
    } else {
      blockNumberInfura = parseInt(JSON.parse(res.body).result, 16);
      blockNumberIncreasePassRateInfura.add(1);
    }
  });

  group('Data consistency blockNumber increase - Alchemy', function () {
    const url = `https://eth-mainnet.g.alchemy.com/v2/`;
    const res = http.post(url, payload, params);

    if (blockNumberAlchemy === 0 && res.body && JSON.parse(res.body).result) {
      blockNumberAlchemy = parseInt(JSON.parse(res.body).result, 16);
    }

    let success = check(res, {
      'block increase check Alchemy': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        parseInt(JSON.parse(r.body).result, 16) > 0 &&
        (parseInt(JSON.parse(r.body).result, 16) - blockNumberAlchemy == 1 ||
          parseInt(JSON.parse(r.body).result, 16) - blockNumberAlchemy == 0),
    });
    if (!success) {
      blockNumberIncreaseErrorRateAlchemy.add(1);
      gaugeAlchemy.add(parseInt(JSON.parse(res.body).result, 16) - blockNumberAlchemy);
    } else {
      blockNumberAlchemy = parseInt(JSON.parse(res.body).result, 16);
      blockNumberIncreasePassRateAlchemy.add(1);
    }
  });

  group('Data consistency blockNumber increase - Pokt', function () {
    const url = `https://eth-rpc.gateway.pokt.network/`;
    const res = http.post(url, payload, params);

    if (blockNumberPokt === 0 && res.body && JSON.parse(res.body).result) {
      blockNumberPokt = parseInt(JSON.parse(res.body).result, 16);
    }

    let success = check(res, {
      'block increase check Pokt': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        parseInt(JSON.parse(r.body).result, 16) > 0 &&
        (parseInt(JSON.parse(r.body).result, 16) - blockNumberPokt == 1 ||
          parseInt(JSON.parse(r.body).result, 16) - blockNumberPokt == 0),
    });
    if (!success) {
      blockNumberIncreaseErrorRatePokt.add(1);
      gaugePokt.add(parseInt(JSON.parse(res.body).result, 16) - blockNumberPokt);
    } else {
      blockNumberPokt = parseInt(JSON.parse(res.body).result, 16);
      blockNumberIncreasePassRatePokt.add(1);
    }
  });

  group('Data consistency blockNumber increase - Quicknode', function () {
    const url = `https://misty-multi-layer.quiknode.pro/`;
    const res = http.post(url, payload, params);

    if (blockNumberQuicknode === 0 && res.body && JSON.parse(res.body).result) {
      blockNumberQuicknode = parseInt(JSON.parse(res.body).result, 16);
    }

    let success = check(res, {
      'block increase check Quicknode': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        parseInt(JSON.parse(r.body).result, 16) > 0 &&
        (parseInt(JSON.parse(r.body).result, 16) - blockNumberQuicknode == 1 ||
          parseInt(JSON.parse(r.body).result, 16) - blockNumberQuicknode == 0),
    });
    if (!success) {
      blockNumberIncreaseErrorRateQuicknode.add(1);
      gaugeQuicknode.add(parseInt(JSON.parse(res.body).result, 16) - blockNumberQuicknode);
    } else {
      blockNumberQuicknode = parseInt(JSON.parse(res.body).result, 16);
      blockNumberIncreasePassRateQuicknode.add(1);
    }
  });

  group('Data consistency blockNumber increase - Coinbase', function () {
    const url = `https://mainnet.ethereum.coinbasecloud.net/`;
    const res = http.post(url, payload, params);

    if (blockNumberCoinbase === 0 && res.body && JSON.parse(res.body).result) {
      blockNumberCoinbase = parseInt(JSON.parse(res.body).result, 16);
    }

    let success = check(res, {
      'block increase check Coinbase': r =>
        r.status === 200 &&
        r.body &&
        JSON.parse(r.body).result &&
        parseInt(JSON.parse(r.body).result, 16) > 0 &&
        (parseInt(JSON.parse(r.body).result, 16) - blockNumberCoinbase == 1 ||
          parseInt(JSON.parse(r.body).result, 16) - blockNumberCoinbase == 0),
    });
    if (!success) {
      blockNumberIncreaseErrorRateCoinbase.add(1);
      gaugeCoinbase.add(parseInt(JSON.parse(res.body).result, 16) - blockNumberCoinbase);
    } else {
      blockNumberCoinbase = parseInt(JSON.parse(res.body).result, 16);
      blockNumberIncreasePassRateCoinbase.add(1);
    }
  });
}
