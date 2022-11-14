import http from 'k6/http';
import { group, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import ethereumjs from 'https://cdn.jsdelivr.net/gh/ethereumjs/browser-builds/dist/ethereumjs-tx/ethereumjs-tx-1.3.3.min.js';
import Common from './common/index.js';

export const options = {
  vus: 1,
  duration: '3000h',
  // iterations: 1,
};

export const getRandomIntInRange = (min, max) => {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - ceilMin) + ceilMin);
};

const fromAddress = '0x3bE0Ec232d2D9B3912dE6f1ff941CB499db4eCe7';
const secretPrivateKey = __ENV.ACCOUNT_PRIVATE_KEY;

export let totRunsInfura = new Counter('totRuns Infura');
export let totRunsAlchemy = new Counter('totRuns Alchemy');
export let getGasPriceErrorInfura = new Counter('getGasPrice Infura');
export let getGasPriceErrorAlchemy = new Counter('getGasPrice Alchemy');
export let getTxCount1ErrorInfura = new Counter('getTxCount1Error Infura');
export let getTxCount1ErrorAlchemy = new Counter('getTxCount1Error Alchemy');
export let getTxCount2ErrorInfura = new Counter('getTxCount2Error Infura');
export let getTxCount2ErrorAlchemy = new Counter('getTxCount2Error Alchemy');
export let sendTxErrorInfura = new Counter('sendTxError Infura');
export let sendTxErrorAlchemy = new Counter('sendTxError Alchemy');
export let passRateInfura = new Counter('Tx mined pass Infura');
export let passRateAlchemy = new Counter('Tx mined pass Alchemy');
export let NotMinedTimeoutInfura = new Counter('Not Mined Timeout Infura');
export let NotMinedTimeoutAlchemy = new Counter('Not Mined Timeout Alchemy');
export let NonceGaugeInfura = new Counter('NonceGauge Infura');
export let NonceGaugeAlchemy = new Counter('NonceGauge Alchemy');

export const payloadGetTransactionByHash = txHash =>
  JSON.stringify({
    id: 1,
    jsonrpc: '2.0',
    params: [txHash],
    method: 'eth_getTransactionByHash',
  });
export const payloadRelaySendTransaction = signature =>
  JSON.stringify({
    id: 1,
    jsonrpc: '2.0',
    params: [signature],
    method: 'eth_sendRawTransaction',
  });
export const payloadGetTransactionCount = (address, block) =>
  JSON.stringify({
    id: 1,
    jsonrpc: '2.0',
    params: [address, block],
    method: 'eth_getTransactionCount',
  });
export const payloadGasPrice = () =>
  JSON.stringify({
    id: 1,
    jsonrpc: '2.0',
    params: [],
    method: 'eth_gasPrice',
  });
export const payloadEthEstimateGas = param =>
  JSON.stringify({
    id: 1,
    jsonrpc: '2.0',
    params: [param],
    method: 'eth_estimateGas',
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
    const privateKey = new ethereumjs.Buffer.Buffer.from(secretPrivateKey, 'hex');
    const res = http.post(url, payloadGetTransactionCount(fromAddress, 'latest'), params);
    const res2 = http.post(url, payloadGasPrice(), params);
    const gasPrice = JSON.parse(res2.body).result;
    // console.log(gasPrice);
    const initialNonce = parseInt(JSON.parse(res.body).result, 16);
    if (!gasPrice) {
      getGasPriceErrorInfura.add(1);
      return;
    }

    if (!initialNonce) {
      getTxCount1ErrorInfura.add(1);
      return;
    }
    console.log(`Initial nonce - Infura: ${initialNonce}`);
    const tx = {
      nonce: JSON.parse(res.body).result,
      from: fromAddress,
      data:
        '0xa9059cbb00000000000000000000000035ffF9272293a0E3c4A847b0842B8ec75c541BDf0000000000000000000000000000000000000000000000000000000000000001',
      to: '0xb5f27A4278c1EECef9DFC3F4Cee5A05b2F8117db',
      value: `0x0`,
      gasLimit: 200000,
      gasPrice: parseInt(gasPrice, 16),
    };

    var common = Common.forCustomChain(
      'goerli',
      {
        name: 'goerli',
        networkId: 5,
        chainId: 5,
        url: 'https://github.com/goerli/testnet',
      },
      'istanbul',
    );

    const transaction = new ethereumjs.Tx(tx, { common });
    transaction.sign(privateKey);

    const sendTxReponse = http.post(
      url,
      payloadRelaySendTransaction(`0x${transaction.serialize().toString('hex')}`),
      params,
    );

    // console.log(JSON.parse(sendTxReponse.body));
    if (!JSON.parse(sendTxReponse.body).result) {
      sendTxErrorInfura.add(1);
      sleep(5)
      return;
    }

    totRunsInfura.add(1)
    let mined = false;
    let maxCount = 200;
    while (!mined && maxCount !== 0) {
      let res = http.post(
        url,
        payloadGetTransactionByHash(JSON.parse(sendTxReponse.body).result),
        params,
      );
      if (JSON.parse(res.body).blockNumber) {
        mined = true;
      } else {
        // console.log('not mined retrying');
        sleep(2);
        maxCount--;
      }
    }

    const response3 = http.post(url, payloadGetTransactionCount(fromAddress, 'latest'), params);
    const finalNonce = parseInt(JSON.parse(response3.body).result, 16);
    console.log(`Final Nonce - Infura: ${finalNonce}`);

    if (mined) {
      passRateInfura.add(1);
    } else if (maxCount === 0) {
      NotMinedTimeoutInfura.add(1);
    }

    if (!finalNonce) {
      getTxCount2ErrorInfura.add(1);
    } else if (finalNonce - initialNonce !== 1) {
      NonceGaugeInfura.add(1);
    }
  });

  group('Data consistency GetBlockByNumber - Alchemy', function () {
    const url = `https://eth-goerli.g.alchemy.com/v2/${__ENV.ALCHEMY_ID}`;
    const privateKey = new ethereumjs.Buffer.Buffer.from(secretPrivateKey, 'hex');
    const res = http.post(url, payloadGetTransactionCount(fromAddress, 'latest'), params);
    const res2 = http.post(url, payloadGasPrice(), params);
    const gasPrice = JSON.parse(res2.body).result;
    if (!gasPrice) {
      getGasPriceErrorAlchemy.add(1);
      return;
    }

    const initialNonce = parseInt(JSON.parse(res.body).result, 16);
    if (!initialNonce) {
      getTxCount1ErrorAlchemy.add(1);
      return;
    }
    console.log(`Initial nonce - Alchemy: ${initialNonce}`);

    const tx = {
      nonce: JSON.parse(res.body).result,
      from: fromAddress,
      data:
        '0xa9059cbb00000000000000000000000035ffF9272293a0E3c4A847b0842B8ec75c541BDf0000000000000000000000000000000000000000000000000000000000000001',
      to: '0xb5f27A4278c1EECef9DFC3F4Cee5A05b2F8117db',
      value: `0x0`,
      gasLimit: 200000,
      gasPrice: parseInt(gasPrice, 16),
    };

    var common = Common.forCustomChain(
      'goerli',
      {
        name: 'goerli',
        networkId: 5,
        chainId: 5,
        url: 'https://github.com/goerli/testnet',
      },
      'istanbul',
    );

    const transaction = new ethereumjs.Tx(tx, { common });
    transaction.sign(privateKey);

    const sendTxReponse = http.post(
      url,
      payloadRelaySendTransaction(`0x${transaction.serialize().toString('hex')}`),
      params,
    );

    console.log(JSON.parse(sendTxReponse.body));
    if (!JSON.parse(sendTxReponse.body).result) {
      sendTxErrorAlchemy.add(1);
      sleep(5)
      return;
    }

    totRunsAlchemy.add(1)
    let mined = false;
    let maxCount = 200;
    while (!mined && maxCount !== 0) {
      let res = http.post(
        url,
        payloadGetTransactionByHash(JSON.parse(sendTxReponse.body).result),
        params,
      );
      if (JSON.parse(res.body).blockNumber) {
        mined = true;
      } else {
        // console.log('not mined retrying');
        sleep(2);
        maxCount--;
      }
    }

    const response3 = http.post(url, payloadGetTransactionCount(fromAddress,'latest'), params);
    const finalNonce = parseInt(JSON.parse(response3.body).result, 16);
    console.log(`Final nonce - Alchemy: ${finalNonce}`);

    if (mined) {
      passRateAlchemy.add(1);
    } else if (maxCount === 0) {
      NotMinedTimeoutAlchemy.add(1);
    }

    if (!finalNonce) {
      getTxCount2ErrorInfura.add(1);
    } else if (finalNonce - initialNonce !== 1) {
      NonceGaugeAlchemy.add(1);
    }
  });
}
