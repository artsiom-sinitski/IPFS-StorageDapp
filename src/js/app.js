//Web3 = require('web3');

App = { 
    /* Configuration variables */
    ipfsHost    : 'localhost',
    ipfsAPIPort : '5001',
    ipfsWebPort : '8080',
    web3Host    : 'http://localhost',
    web3Port    : '8545', 
    
  
    init: function() {
        console.log("App initialized");
        return App.initIPFS();
    },

    /* IPFS initialization */
    initIPFS: function() {
        ipfs = window.IpfsApi(App.ipfsHost, App.ipfsAPIPort);

        ipfs.swarm.peers(function (err, res) {
            if (err) {
                console.error(err);
            } else {
                var numPeers = res.Peers === null ? 0 : res.Peers.length;
                console.log("IPFS - connected to " + numPeers + " peers");
            }
        });
        return App.initWeb3();
    },


    initWeb3: function() {
        /* web3 initialization */
        web3 = new Web3();

        web3.setProvider(new web3.providers.HttpProvider(App.web3Host + ':' + App.web3Port));
        if (!web3.isConnected()) {
            console.error("Ethereum - no connection to RPC server");
        } else {
            console.log("Ethereum - connected to RPC server");
        }
    },


    deployStorage: function() {
        /* JavaScript smart contract interface */
        var account = web3.eth.accounts[0];

        var contractInterface = [{
            "constant": false,
            "inputs": [{
                "name": "x",
                "type": "string"
                }],
            "name": "set",
            "outputs": [],
            "type": "function"
        }, 
        {
            "constant": true,
            "inputs": [],
            "name": "get",
            "outputs": [{
                "name": "x",
                "type": "string"
                }],
            "type": "function"
        }];
        
        var contractObject = {
            from: account,
            gas: 300000,
            data: '0x6060604052610282806100126000396000f360606040526000357c0100000000000000000000000000000000000000000000000000000000900480634ed3885e146100445780636d4ce63c1461009a57610042565b005b6100986004808035906020019082018035906020019191908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050909091905050610115565b005b6100a760048050506101c6565b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156101075780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b8060006000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061016457805160ff1916838001178555610195565b82800160010185558215610195579182015b82811115610194578251826000505591602001919060010190610176565b5b5090506101c091906101a2565b808211156101bc57600081815060009055506001016101a2565b5090565b50505b50565b602060405190810160405280600081526020015060006000508054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102735780601f1061024857610100808354040283529160200191610273565b820191906000526020600020905b81548152906001019060200180831161025657829003601f168201915b5050505050905061027f565b9056'
        };

        var sendDataObject = {
            from: account,
            gas: 300000,
        };

        window.ipfs = ipfs;
        window.web3 = web3;
        window.account = account;
        window.contractObject = contractObject;
        window.contract = web3.eth.contract(contractInterface);
        window.ipfsAddress = "http://" + App.ipfsHost + ':' + App.ipfsWebPort + "/ipfs";

        window.IPFSHash = null;
        window.currentData = null;

        if (window.contractInstance) {
            console.error('Contract already been deployed at: ', window.contractAddress);
            return;
        }

        window.contract.new(window.contractObject, function (err, contract) {
            if (err) {
                console.error("Contract deployment error: ", err);
            } else if (contract.address) {
                window.contractAddress = contract.address;
                window.contractInstance = window.contract.at(contract.address);
                console.log("Contract successfully deployed at: ", contract.address);
            } else if (contract.transactionHash) {
                console.log("Awaiting contract deployment with transaction hash: ", contract.transactionHash);
            } else {
                console.error("Unresolved contract deployment error");
            }
        });
    },


    storeContent: function(url) {
        window.ipfs.add(url, function(err, result) {
            if (err) {
                console.error("Content submission error:", err);
                return false;
            } else if (result && result[0] && result[0].Hash) {
                console.log("Content successfully stored. IPFS address:", result[0].Hash);
            } else {
                console.error("Unresolved content submission error");
                return null;
            }
        });
    },


    storeAddress: function(data) {
        if (!window.contractInstance) {
            console.error('Ensure the storage contract has been deployed');
            return;
        }
        if (window.currentData == data) {
            console.error("Overriding existing data with same data");
            return;
        }

        console.log("Address string: ", data);
        console.log("ContractInstance: ", window.contractInstance);

        window.contractInstance.set.sendTransaction(data, window.sendDataObject, function (err, result) {
            if (err) {
                console.error("Transaction submission error:", err);
            } else {
                window.currentData = data;
                console.log("Address successfully stored. Transaction hash:", result);
            }
        });
    },


    fetchContent: function () {
        if (!window.contractInstance) {
            console.error("Storage contract has not been deployed");
            return;
        }
        window.contractInstance.get.call(function (err, result) {
            if (err) {
                console.error("Content fetch error:", err);
            } else if (result && window.IPFSHash == result) {
                console.log("New data is not mined yet. Current data: ", result);
                return;
            } else if (result) {
                window.IPFSHash = result;
                var URL = window.ipfsAddress + "/" + result;
                console.log("Content successfully retrieved. IPFS address", result);
                console.log("Content URL:", URL);
            } else {
                console.error('No data, verify the transaction has been mined');
            }
        });
    },


    getBalance: function () {
        window.web3.eth.getBalance(window.account, function (err, balance) {
            console.log(parseFloat(window.web3.fromWei(balance, "ether")));
        });
    }
    
}


$(function() {
    $(window).load(function() {
        App.init();
    });
});