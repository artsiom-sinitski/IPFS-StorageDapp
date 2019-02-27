// Store environment-specific variable from '.env' to process.env
require('dotenv').config();  
const HDWalletProvider = require('truffle-hdwallet-provider');


module.exports = {

  networks: {
    development: {
      host: "127.0.0.1",  // Localhost (default: none)
      port: 7545,         // Standard Ethereum port (default: none)
      network_id: "5777"  //  Any network (default: none)
      //gas: 8000000,     // Gas sent with each transaction (default: ~6700000)
      //gasPrice: 20000000000
    },

    ropsten: {
      provider: () => new HDWalletProvider
                          (
                           process.env.MNEMONIC, 
                           "https://ropsten.infura.io/${process.env.INFURA_API_KEY}"
                           //the link below provided by Infura doesn't seem to work when deploying
                           //`https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`
                          ),
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      // version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
      //  evmVersion: "byzantium"
      // }
    }
  }
}
