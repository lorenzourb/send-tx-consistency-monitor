import http from 'k6/http';
import { group, check } from 'k6';
import { Counter, Gauge } from 'k6/metrics';

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

export let non200ErrorRateInfura = new Gauge('Non 200 Errors Infura');
export let non200ErrorRateAlchemy = new Gauge('Non 200 Errors Alchemy');

export let blockNumberIncreaseErrorRateInfura = new Counter('Block Number Increase Errors Infura');
export let blockNumberIncreaseErrorRateAlchemy = new Counter(
  'Block Number Increase Errors Alchemy',
);

export let blockNumberIncreasePassRateInfura = new Counter('Block Number Increase Pass Infura');
export let blockNumberIncreasePassRateAlchemy = new Counter('Block Number Increase Pass Alchemy');

export let blockNumberInfura = 0;
export let blockNumberAlchemy = 0;

export let blockNumberInfuraGauge = new Gauge('Infura block number gauge');
export let blockNumberAlchemyGauge = new Gauge('Alchemy block number gauge');

const gaugeInfura = new Gauge('Infura gauge');
const gaugeAlchemy = new Gauge('Alchemy gauge');

export const payload = JSON.stringify({
  id: 1,
  jsonrpc: '2.0',
  params: [],
  method: 'eth_blockNumber',
});
export const params = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: '60s',
};

export default function () {
  group('Data consistency blockNumber increase - Infura', function () {
    const url = `https://mainnet.infura.io/v3/${__ENV.INFURA_ID}`;
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
      if (res.status !== 200) {
        non200ErrorRateInfura.add(res.status);
      } else {
        if (
          res.body &&
          JSON.parse(res.body).result &&
          parseInt(JSON.parse(res.body).result, 16) > 0 &&
          parseInt(JSON.parse(res.body).result, 16) - blockNumberInfura > 1
        ) {
          blockNumberInfura = parseInt(JSON.parse(res.body).result, 16);
        }
        console.log(
          `Infura res.body: ${res.body} and json parsed: ${
            JSON.parse(res.body).result
          } and parsed int: ${parseInt(JSON.parse(res.body).result, 16)}`,
        );
        console.log(
          `Infura eq 1: ${
            parseInt(JSON.parse(res.body).result, 16) - blockNumberInfura == 1
          } prev block: ${blockNumberInfura}`,
        );
        console.log(
          `Infura eq 0: ${
            parseInt(JSON.parse(res.body).result, 16) - blockNumberInfura == 0
          } prev block: ${blockNumberInfura}`,
        );
        blockNumberIncreaseErrorRateInfura.add(1);
        gaugeInfura.add(parseInt(JSON.parse(res.body).result, 16) - blockNumberInfura);
      }
    } else {
      blockNumberInfura = parseInt(JSON.parse(res.body).result, 16);
      blockNumberIncreasePassRateInfura.add(1);
      blockNumberInfuraGauge.add(parseInt(JSON.parse(res.body).result, 16));
    }
  });

  group('Data consistency blockNumber increase - Alchemy', function () {
    const url = `https://eth-mainnet.g.alchemy.com/v2/${__ENV.ALCHEMY_ID}`;
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
      if (res.status !== 200) {
        non200ErrorRateAlchemy.add(res.status);
      } else {
        if (
          res.body &&
          JSON.parse(res.body).result &&
          parseInt(JSON.parse(res.body).result, 16) > 0 &&
          parseInt(JSON.parse(res.body).result, 16) - blockNumberAlchemy > 1
        ) {
          blockNumberAlchemy = parseInt(JSON.parse(res.body).result, 16);
        }
        console.log(
          `Alchemy res.body: ${res.body} and json parsed: ${
            JSON.parse(res.body).result
          } and parsed int: ${parseInt(JSON.parse(res.body).result, 16)}`,
        );
        console.log(
          `Alchemy eq 1: ${
            parseInt(JSON.parse(res.body).result, 16) - blockNumberAlchemy == 1
          } prev block: ${blockNumberAlchemy}`,
        );
        console.log(
          `Alchemy eq 0: ${
            parseInt(JSON.parse(res.body).result, 16) - blockNumberAlchemy == 0
          } prev block: ${blockNumberAlchemy}`,
        );
        blockNumberIncreaseErrorRateAlchemy.add(1);
        gaugeAlchemy.add(parseInt(JSON.parse(res.body).result, 16) - blockNumberAlchemy);
      }
    } else {
      blockNumberAlchemy = parseInt(JSON.parse(res.body).result, 16);
      blockNumberIncreasePassRateAlchemy.add(1);
      blockNumberAlchemyGauge.add(parseInt(JSON.parse(res.body).result, 16));
    }
  });
}
