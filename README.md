1. Description.

IPFS + Ethereum Storage Dapp.
This is a simple datastore solution using IPFS and Ethereum. IPFS provides a convenient interface for distributed data storage, with a hash-based content address for reference to a data file. This address will be stored in a smart contract on a private Ethereum blockchain. To retrieve the latest data, user will fetch the address from the blockchain and query IPFS for the associated file.

2. Dapp Build Guide.
This dapp has the following dependencies:

IPFS - the Interplanetary File System
Geth - the Go implementation of Ethereum Node

2.1 Install Geth

2.2 Install IPFS

2.3 Initialize an Ethereum node

2.3.1 Setup Geth
      ##> geth --datadir="./" account new


2.3.2 Define a genesis block
      In the directory containing your account, copy/paste/save the following JSON into a file called "genesisblock.json":
    {
        "config": {
            "chainID"       : 10,
            "homesteadBlock": 0,
            "eip155Block":    0,
            "eip158Block":    0
        },
        "nonce": "0x01",
        "difficulty": "0x20000",
        "mixhash": "0x00000000000000000000000000000000000000647572616c65787365646c6578",
        "coinbase": "0x0000000000000000000000000000000000000000",
        "timestamp": "0x00",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "extraData": "0x00",
        "gasLimit": "0x2FEFD8",
        "alloc": {
        }
    }
This will be block 0 of your private blockchain. If you ever wish to have others join this network, they will need this genesis block as well.

We will now instantiate the blockchain network and load the geth console:

##> geth --datadir="./" init genesisblock.json
##> geth --datadir="./" --networkid 23422  --rpc --rpccorsdomain="*" --rpcport="8545" --minerthreads="1" --mine --nodiscover --maxpeers=0 --unlock 0 console

The --datadir flag tells geth the path for storing blockchain data. The --networkid flag gives your private blockchain a unique reference ID. The --rpc and related flags enable remote procedure call (RPC) functionality for web3. The --minerthreads flag enables the specified number of CPU threads for mining. The --mine flag indicates the mine function for processing transactions and propagating smart contracts through the network. The --nodiscover and --maxpeers flag disables peer discovery mechanisms. The --unlock 0 flag unlocks the first account in the system. The --console flag enables the REPL terminal.

As this is our first time running the --mine flag, wait for the DAG file to be generated. You will see Generating DAG: xx% for a couple minutes. This is a one-time operation.


2.3.3 Initialize IPFS
##> ipfs init
##> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
##> ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
##> ipfs daemon


2.4 Run the decentralized application
Open "index.html" file and follow the instructions on the front page.