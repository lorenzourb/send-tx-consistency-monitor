import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check, sleep } from 'k6';
import { Rate } from "k6/metrics";
import { SCENARIOS } from './harmony_settings.js';

const setting = SCENARIOS.get(`${__ENV.env}`)

const url=setting.url
const loadProfile = setting.loadProfile

const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('../rpc_jsons/rpcs_harmony_call.json'));
});

export const options = {
  scenarios: {
    harmonyLoadTest: loadProfile
  }
};

export let infuraErrorRate = new Rate("InfuraErrors");

export default function () {
  group('Infura - Harmony - READ/GET', function () {
    const payload = JSON.stringify(data[Math.floor(Math.random() * data.length)]);
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s'
    };
    const res = http.post(url, payload, params);
    //console.log(JSON.stringify(res.body));
    let success = check(res, {
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
      'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) { 
      console.log(`${payload}: ${res.body}`);
      infuraErrorRate.add(1);
    }
    
  });

}