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
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider("http://" + App.web3Host + ':' + App.web3Port);
            web3 = new Web3(App.web3Provider);
        }
        if (!web3.isConnected()) {
            console.error("Ethereum - no connection to RPC server");
        } else {
            console.log("Ethereum - connected to RPC server");
        }
        return App.initStorage();
    },


    initStorage: function() {
        App.account = web3.eth.accounts[0];

        $.getJSON("IpfsStorage.json", function(ipfsStorage) {
                App.contracts.ipfsStorage = TruffleContract(ipfsStorage);
                App.contracts.ipfsStorage.setProvider(App.web3Provider);        
                App.contracts.ipfsStorage.deployed().then(function(ipfsStorage) {
                    console.log("IPFS Storage contract's address: ", ipfsStorage.address);
                })
        });
        return App.renderPage();
    },


    renderPage: function() {
        web3.eth.getCoinbase(function(error, account) {
            if (error) {
                console.error(error);
            } else {
                console.log("Wallet account:", account);
                $('#walletAddr').html(account);
            }
        });
        return App.getBalance();
    },


    getBalance: function() {
        web3.eth.getBalance(App.account, function(error, balance) {
            if (error) {
                console.error(error);
            } else {
                let bal = parseFloat(web3.fromWei(balance, "ether")).toFixed(3);
                console.log("Account balance: ", bal);
                $('#accountBalance').html(bal);
            }
        });
        return App.bindEvents();
    },


    bindEvents: function() {
        $(document).on('click', '#btnFetchContent', App.handleFetchContent);
    },


    handleStoreContent: function() {
        let url = $('#inputURL').val();
        let mediaType = $("#selectMediaType option:selected").val();
        let desc = $('#inputDescription').val();

        $.get(url).done(function(result) {
            return App.storeContent(url, mediaType, desc);
        }).fail(function(error) {
            let errMsg = "Invalid URL: Content " + error.statusText + " (" + error.status + ')'
            console.error(errMsg + error);
            alert(errMsg);
        });

        $('#inputURL').val('');
        $('#inputDescription').val('');
        $('#selectMediaType').val('').text();
    },


    handleFetchContent: function() {
        $('#tableStoredContent tbody').empty();
        return App.fetchContent();
    },


    //************************* Sample Image URLs *******************************
    //
    //  (0) -->  https://www.ethereum.org/images/wallpaper-homestead.jpg
    //  (1) -->  https://www.ethereum.org/images/bad-robot@2x.png
    //  (2) -->  https://www.ethereum.org/images/tutorial/deploy-new-contract.png
    //  (3) -->  https://www.ethereum.org/images/tutorial/edit-contract.png
    //  (4) -->  https://www.ethereum.org/images/tutorial/function-picker.png
    //
    //**************************************************************************** 

    storeContent: function(url, mediaType, desc) {
        ipfs.add(url, function(error, result) {
            if (error) {
                let errMsg = "Content submission error:" + error;
                console.error(errMsg);
                alert(errMsg);
                return false;
            } else if (result && result[0] && result[0].Hash) {
                let ipfsHash = result[0].Hash;
 
                let msg = "Content successfully stored! IPFS address:" + '\n' + ipfsHash;
                console.log(msg);
                alert(msg);

                return App.storeAddress(ipfsHash, mediaType, desc);
            } else {
                let errMsg = "Unresolved content submission error!"
                console.error(errMs);
                alert(errMsg);
                return null;
            }
        });
    },


    //TO DO: display a warning to a user if he attempts to store duplicate content.
    // Currently, the storage contract programmatically doesn't allow this anyway
    storeAddress: function(ipfsHash, mediaType, desc) {
        let storageInstance;
        App.contracts.ipfsStorage.deployed().then(function(instance) {
            storageInstance = instance;
            let metaData = {from: App.account, to: storageInstance.address, gas: 300000};
            return storageInstance.storeMediaToIPFS.sendTransaction(ipfsHash, mediaType, desc, metaData);
        }).then(function(result) {
            let msg = "Address successfully stored! Transaction hash: " + '\n' + result;
            console.log(msg);
        }).catch(function(error) {
            let errMsg = "Failed to store IPFS address!" + '\n';
            console.error(errMsg + error);
            alert(errMsg + error);
        });
    },

    
    fetchContent: function() {
        let storageInstance;
        App.contracts.ipfsStorage.deployed().then(function(instance) {
            storageInstance = instance;
            return storageInstance.getStoredDataSize().then(function(len) {
                for(let i = 0; i < len.toNumber(); i++) {
                    storageInstance.getStoredDataRecordAtIndex(i).then(function(record) {              
                        App.generateTableContent(record, i);
                    });
                }
            });
        });
        let msg = "All stored content successfully retrieved!"
        console.log(msg);
        alert(msg);
    },


    generateTableContent: function(record, i) { 
        // [k, t, d] maps to [ipfsHash, mediaType, description]
        let [k, tp, dsc] = record;
        let URL = App.ipfsAddress + "/" + k.toString();
        let URL_link = "<a href=\"" + URL + " \"target=\"_blank\">" + "IPFS address " + (i+1) + "</a>"
        let rowHTML = "<tr>";
            rowHTML += "<td title=\"" + URL + "\">" + URL_link + "</td>";
            rowHTML += "<td title=\"" + tp + "\">" + tp + "</td>";
            rowHTML += "<td title=\"" + dsc + "\">" + dsc + "</td>";
            rowHTML += "</tr>";
    
        $(rowHTML).prependTo('#tableStoredContent tbody');
    }
},


$(function() {
    $(window).load(function() {
        App.init();
    });
});