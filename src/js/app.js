App = { 
    /* Configuration variables */
    web3Provider: null,
    web3Host    : 'localhost', //127.0.0.1
    web3Port    : '8545',

    ipfsHost    : 'localhost',
    ipfsAPIPort : '5001',
    ipfsWebPort : '8080',
    ipfsAddress : null,

    account     : '0x0',
    contracts   : {},
    /* End of configuration variables */

  
    init: function() {
        console.log("App initialized");
        return App.initIPFS();
    },

    /* IPFS initialization */
    initIPFS: function() {
        ipfs = IpfsApi(App.ipfsHost, App.ipfsAPIPort);
        App.ipfsAddress = "http://" + App.ipfsHost + ':' + App.ipfsWebPort + "/ipfs";


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


    /* web3 initialization */
    initWeb3: function() {
        /*if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {*/
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider("http://" + App.web3Host + ':' + App.web3Port);
            web3 = new Web3(App.web3Provider);
            if (!web3.isConnected()) {
                console.error("Ethereum - no connection to RPC server");
            } else {
                console.log("Ethereum - connected to RPC server");
            }
        //}
        return App.initStorage();
    },


    initStorage: function() {
        App.account = web3.eth.accounts[0];

        $.getJSON("IpfsStorage.json", function(ipfsStorage) {
                App.contracts.ipfsStorage = TruffleContract(ipfsStorage);
                App.contracts.ipfsStorage.setProvider(App.web3Provider);        
                App.contracts.ipfsStorage.deployed().then(function(ipfsStorage) {
                    console.log("'IPFS Storage' contract address: ", ipfsStorage.address);
                })
        });
    },

    //TO DO: if invalid URL, function still returns IPFS hash
    storeContent: function(url) {
        /*
        ipfs.add(url, function(err, result) {
            if (err) {
                console.error("Content submission error:", err);
                return false;
            } else if (result && result[0] && result[0].Hash) {
                console.log("Content successfully stored! IPFS address:");
                console.log(result[0].Hash);
            } else {
                console.error("Unresolved content submission error");
                return null;
            }
        }); */

        ipfs.add(url, function(err, result) {
            console.log("Result: ", result);
            console.log("Erorr: ", err);
            if (err) {
                console.error("Content submission error:", err);
                return false;
            } else if (result && result[0] && result[0].Hash) {
                console.log("Content successfully stored! IPFS address:");
                console.log(result[0].Hash);
            } else {
                console.error("Unresolved content submission error");
                return null;
            }
        });
    },


    storeAddress: function(data) {
        /*
        if (window.currentData == data) {
            console.error("Overriding existing data with same data");
            return;
        }*/
        let storageInstance;
        App.contracts.ipfsStorage.deployed().then(function(instance) {
            storageInstance = instance;
            let metaData = {from: App.account, to: storageInstance.address, gas: 300000}
            return storageInstance.setStoredData.sendTransaction(data, metaData);
        }).then(function(result) {
            console.log("Address successfully stored! Transaction hash:");
            console.log(result)
        }).catch(function(error) {
            console.log("storeAddress() ->", error)
        });
    },


    fetchContent: function() {
        let storageInstance;
        App.contracts.ipfsStorage.deployed().then(function(instance) {
            storageInstance = instance;
            return storageInstance.getStoredData();
        }).then(function(result) {
            var URL = App.ipfsAddress + "/" + result.toString();
            console.log("Content successfully retrieved! IPFS address:");
            console.log(result);
            console.log("Content URL:");
            console.log(URL);
        }).catch(function(error) {
            console.log("fetchContent() ->", error);
        });
    },


    getBalance: function() {
        web3.eth.getBalance(App.account, function(error, balance) {
            if (error) {
                console.log("getBalance() ->", error);
            } else {
                console.log(parseFloat(web3.fromWei(balance, "ether")));
            }
        });
    }
}


$(function() {
    $(window).load(function() {
        App.init();
    });
});