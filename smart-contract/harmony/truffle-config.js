require('dotenv').config()

//const { TruffleProvider } = require('@harmony-js/core')
const TruffleProvider  = require('@truffle/hdwallet-provider');
//Local
const local_private_key = process.env.LOCAL_PRIVATE_KEY
const local_url = process.env.LOCAL_0_URL;

//Testnet
const testnet_private_key = process.env.TESTNET_PRIVATE_KEY
const testnet_url = process.env.TESTNET_0_URL


//GAS - Currently using same GAS accross all environments
gasLimit = process.env.GAS_LIMIT
gasPrice = process.env.GAS_PRICE

module.exports = {
  networks: {
    local: {
        network_id: 1666700000, 
        provider: () => {
          return new TruffleProvider({
              privateKeys: [local_private_key],
              providerOrUrl: local_url
          });
        },
      },
    testnet: {
      network_id: 1666700000, 
      provider: () => {
        return new TruffleProvider({
            privateKeys: [testnet_private_key],
            providerOrUrl: testnet_url
        });
      },
    },
  },

  mocha: {
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.8"
    }
  }
}