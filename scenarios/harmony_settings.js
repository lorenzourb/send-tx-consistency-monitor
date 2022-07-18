import { K6Executors } from "./helpers/executors.js"

var SCENARIOS = new Map()
SCENARIOS.set('local_0', {
    "url": "http://localhost:9500",
    "chainId": 0,
    "shardID": 0,
    "loadProfile":{
        "executor": K6Executors.constantArrivalRate,
        "rate": 1,
        "timeUnit": "1s",
        "duration": "1m",
        "preAllocatedVUs": 10,
        "maxVUs": 20,
    }
})
SCENARIOS.set('local_100', {
        "url": "http://localhost:9500",
        "chainId": 0,
        "shardID": 0,
        "loadProfile":{
            "executor": K6Executors.constantArrivalRate,
            "rate": 100,
            "timeUnit": "1s",
            "duration": "10m",
            "preAllocatedVUs": 100,
            "maxVUs": 300,
        }
    })
SCENARIOS.set('local_500', {
        "url": "http://localhost:9500",
        "chainId": 0,
        "shardID": 0,
        "loadProfile":{
            "executor": K6Executors.constantArrivalRate,
            "rate": 500,
            "timeUnit": "1s",
            "duration": "10m",
            "preAllocatedVUs": 500,
            "maxVUs": 900,
        }
    })
SCENARIOS.set('local_1500',{
        "url": "http://localhost:9500",
        "chainId": 0,
        "shardID": 0,
        "loadProfile":{
            "executor": K6Executors.constantArrivalRate,
            "rate": 1500,
            "timeUnit": "1s",
            "duration": "10m",
            "preAllocatedVUs": 2000,
            "maxVUs": 3000,
        }
    })
SCENARIOS.set('local_spiked',{
    "url": "http://localhost:9500",
    "chainId": 0,
    "shardID": 0,
    "loadProfile":{
        "executor": K6Executors.rampingArrivalRate,
        // Our test with at a rate of 300 iterations started per `timeUnit` (e.g minute).
        startRate: 300,

        // It should start `startRate` iterations per minute
        timeUnit: '1s',

        // It should preallocate 2 VUs before starting the test.
        preAllocatedVUs: 2000,

        // It is allowed to spin up to 50 maximum VUs in order to sustain the defined
        // constant arrival rate.
        maxVUs: 5000,

        stages: [
            // It should start 300 iterations per `timeUnit` for the first minute.
            { target: 300, duration: '1m' },

            // It should linearly ramp-up to starting 1500 iterations per `timeUnit` over the following two minutes.
            { target: 15000, duration: '2m' },

            // It should linearly ramp-down to starting 60 iterations per `timeUnit` over the last two minute.
            { target: 60, duration: '2m' },
        ],

    }
})
SCENARIOS.set('dev_0', {
    "url": "http://harmony-mainnet-shard-0.dev.k8s.internal",
    "chainId": 0,
    "shardID": 0,
    "loadProfile":{
        "executor": K6Executors.constantArrivalRate,
        "rate": 1,
        "timeUnit": "1s",
        "duration": "1m",
        "preAllocatedVUs": 10,
        "maxVUs": 20
    }
})
SCENARIOS.set('dev_1500', {
        "url": "http://harmony-mainnet-shard-0.dev.k8s.internal",
        "chainId": 0,
        "shardID": 0,
        "loadProfile":{
            "executor": K6Executors.constantArrivalRate,
            "rate": 450,
            "timeUnit": "1s",
            "duration": "3m",
            "preAllocatedVUs": 2000,
            "maxVUs": 5000
    }
    })
SCENARIOS.set('k8s_s0', {
        "url": "http://mainnet-explorer-rpc-shard-0:9500",
        "chainId": 0,
        "shardID": 0,
        "loadProfile":{
            "executor": K6Executors.constantArrivalRate,
            "rate": 1,
            "timeUnit": "1s",
            "duration": "1m",
            "preAllocatedVUs": 10,
            "maxVUs": 20
        }
    })
SCENARIOS.set('k8s_s1', {
    "url": "http://mainnet-explorer-rpc-shard-1:9500",
    "chainId": 0,
    "shardID": 1,
    "loadProfile":{
        "executor": K6Executors.constantArrivalRate,
        "rate": 1,
        "timeUnit": "1s",
        "duration": "1m",
        "preAllocatedVUs": 10,
        "maxVUs": 20
    }
})
const Account = {
    "from": {
        "privateKey": "9cd3c6817384ae3fa5189ade0e74a26a20f0464db203b68909c4ed28b5aaa4bc",
        "password": "harmony",
        "account": "one1c0gmg6zjpqazxy0exhn6zyvhyyf8pdnq6uj0qj",
        "mnemonic": "draw endorse hospital furnace sibling know cushion update wine life acquire want scare street young flag panel twelve bleak tree curious salt setup that"
    },
    "to": {
        "privateKey": "2f67268e1f4ac61e2b975a94ca1c61a72bfa666f8ed9bd43677b2dc23d37b8fb",
        "password": "harmony",
        "account": "one1d9da36glpmpn6k0wtra8ra66wfynax6d4wha59",
        "mnemonic": "true tiny brass faith donkey blossom increase garbage require resemble eternal debris icon flat other cargo family chase volcano roast reduce deposit census vendor"
    }
}

export {SCENARIOS, Account}