import http from 'k6/http';
import { group, check } from 'k6';
import { Rate } from "k6/metrics";

// const data = new SharedArray('Rpcs', function () {
//   return JSON.parse(open('./rpcs_near_write.json'));
// });

export const options = {
  vus: 1,
  iterations: 1
};

// export const options = {
//   scenarios: {
//     contacts: {
//       executor: 'constant-arrival-rate',
//       rate: 300,
//       duration: '5m',
//       preAllocatedVUs: 150,
//       maxVUs: 300,
//     },
//   }
// };

const signedTx= 'EQAAAGluZnVyYV9xYS50ZXN0bmV0ALInz9U9EnWSBzpfiqurVzBiPgga39OAXdVO5wy4iM+SRVnAb81JAAAbAAAAZ3Vlc3Rib29rX2luZnVyYV9xYS50ZXN0bmV0pXk3+K8GHP5+hx9NFd9nfZMqZndS4khwG8TfWMAclfUBAAAAAwAAoN7Frck1NgAAAAAAAAAATBrNxaPpgqjj89wlv3sM9CGEjIMz+AnGZuL8L4NN7vm2uGrhPvPV6xsejn9S4bLEgicq1BzCXDvI4NbeaRmJDg=='
const broadcast_tx_commit = `{"jsonrpc": "2.0", "id": 0, "method": "broadcast_tx_commit",  "params": ["${signedTx}"]}`

export let infuraErrorRate = new Rate("InfuraErrors");

export default function () {
  group('Infura - Near - Production like traffic (write)', function () {
    const url = `ADD_URL_HERE`;
    const payload = broadcast_tx_commit;
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '120s'
    };
    const res = http.post(url, payload, params);
    console.log(JSON.stringify(res));
    let success = check(res, {
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
      'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) { 
      console.log(JSON.stringify(res.body));
      infuraErrorRate.add(1);
    }
    
  });
}