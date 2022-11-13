module.exports = {
  "name": "goerli",
  "chainId": 5,
  "networkId": 5,
  "comment": "Cross-client PoA test network",
  "url": "https://github.com/goerli/testnet",
  "genesis": {
    "hash": "0xbf7e331f7f7c1dd2e05159666b3bf8bc7a8a3a9eb1d518969eab529dd9b88c1a",
    "timestamp": "0x5c51a607",
    "gasLimit": 10485760,
    "difficulty": 1,
    "nonce": "0x0000000000000000",
    "extraData": "0x22466c6578692069732061207468696e6722202d204166726900000000000000e0a2bd4258d2768837baa26a28fe71dc079f84c70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "stateRoot": "0x5d6cded585e73c4e322c30c2f782a336316f17dd85a4863b9d838d2d4b8b3008"
  },
  "hardforks": [
    {
      "name": "chainstart",
      "block": 0,
      "consensus": "poa",
      "finality": null
    },
    {
      "name": "homestead",
      "block": 0,
      "consensus": "poa",
      "finality": null
    },
    {
      "name": "dao",
      "block": 0,
      "consensus": "poa",
      "finality": null
    },
    {
      "name": "tangerineWhistle",
      "block": 0,
      "consensus": "poa",
      "finality": null
    },
    {
      "name": "spuriousDragon",
      "block": 0,
      "consensus": "poa",
      "finality": null
    },
    {
      "name": "byzantium",
      "block": 0,
      "consensus": "poa",
      "finality": null
    },
    {
      "name": "constantinople",
      "block": 0,
      "consensus": "poa",
      "finality": null
    },
    {
      "name": "petersburg",
      "block": 0,
      "consensus": "poa",
      "finality": null
    },
    {
      "name": "istanbul",
      "block": 1561651,
      "consensus": "poa",
      "finality": null
    }
  ],
  "bootstrapNodes": [
    {
      "ip": "51.141.78.53",
      "port": 30303,
      "id": "011f758e6552d105183b1761c5e2dea0111bc20fd5f6422bc7f91e0fabbec9a6595caf6239b37feb773dddd3f87240d99d859431891e4a642cf2a0a9e6cbb98a",
      "location": "",
      "comment": "Source: https://github.com/goerli/testnet/blob/master/bootnodes.txt"
    },
    {
      "ip": "13.93.54.137",
      "port": 30303,
      "id": "176b9417f511d05b6b2cf3e34b756cf0a7096b3094572a8f6ef4cdcb9d1f9d00683bf0f83347eebdf3b81c3521c2332086d9592802230bf528eaf606a1d9677b",
      "location": "",
      "comment": "Source: https://github.com/goerli/testnet/blob/master/bootnodes.txt"
    },
    {
      "ip": "94.237.54.114",
      "port": 30313,
      "id": "46add44b9f13965f7b9875ac6b85f016f341012d84f975377573800a863526f4da19ae2c620ec73d11591fa9510e992ecc03ad0751f53cc02f7c7ed6d55c7291",
      "location": "",
      "comment": "Source: https://github.com/goerli/testnet/blob/master/bootnodes.txt"
    },
    {
      "ip": "52.64.155.147",
      "port": 30303,
      "id": "c1f8b7c2ac4453271fa07d8e9ecf9a2e8285aa0bd0c07df0131f47153306b0736fd3db8924e7a9bf0bed6b1d8d4f87362a71b033dc7c64547728d953e43e59b2",
      "location": "",
      "comment": "Source: https://github.com/goerli/testnet/blob/master/bootnodes.txt"
    },
    {
      "ip": "213.186.16.82",
      "port": 30303,
      "id": "f4a9c6ee28586009fb5a96c8af13a58ed6d8315a9eee4772212c1d4d9cebe5a8b8a78ea4434f318726317d04a3f531a1ef0420cf9752605a562cfe858c46e263",
      "location": "",
      "comment": "Source: https://github.com/goerli/testnet/blob/master/bootnodes.txt"
    }
  ]
}
