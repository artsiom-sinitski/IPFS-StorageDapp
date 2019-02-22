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
    //TO DO: implement MetaMask functionality
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
                    console.log("IPFS Storage contract's address: ", ipfsStorage.address);
                })
        });
        return App.renderPage();
    },


    renderPage: function() {
        web3.eth.getCoinbase(function(error, account) {
            if (error) {
                console.log(error);
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
                console.log(error);
            } else {
                let bal = parseFloat(web3.fromWei(balance, "ether"));
                console.log("Account balance: ", bal);
                $('#accountBalance').html(bal);
            }
        });
        return App.bindEvents();
    },


    bindEvents: function() {
        $(document).on('click', '#FetchContentBtn', App.handleFetchContent);
    },


    handleStoreContent: function() {
        let url = $('#URLinput').val();

        $.get(url).done(function(result) {
            return App.storeContent(url);
        }).fail(function(error) {
            console.log("Invalid URL: ", error.status, error.statusText);
        });

        $('#URLinput').val('');
        $('#DescriptionInput').val('');
        $('#MediaTypeDropdown').val('').text();
    },


    handleFetchContent: function() {
        $('#StoredContentTable tbody').empty();
        return App.fetchContent();
    },


    //************************* Sample Image URLs *******************************
    //
    //  (0) -->  https://www.ethereum.org/images/wallpaper-homestead.jpg
    //  (1) -->  https://www.ethereum.org/images/bad-robot@2x.png
    //  (2) -->  https://www.ethereum.org/images/tutorial/deploy-new-contract.png
    //  (3) -->  https://www.ethereum.org/images/tutorial/edit-contract.png
    //
    //**************************************************************************** 

    //TO DO: get the user input from a web page
    storeContent: function(url) {
        ipfs.add(url, function(error, result) {
            if (error) {
                console.error("Content submission error:", error);
                return false;
            } else if (result && result[0] && result[0].Hash) {
                let ipfsHash = result[0].Hash;
                let mediaType = $('#MediaTypeDropdown :selected').text();
                let desc = $('#DescriptionInput').val();

                console.log("storeContent->mediaType", mediaType);
                console.log("storeContent->desc", desc);

                console.log("Content successfully stored! IPFS address:");
                console.log("IPFS hash: ", ipfsHash);
                return App.storeAddress(ipfsHash, mediaType, desc);
            } else {
                console.error("Unresolved content submission error!");
                return null;
            }
        });
    },


    //TO DO: disallow adding duplicate media data entries (partially works):
    // currently, App.storeContent() function generates a new transactions
    // every time it is called, though storageContract never adds a duplicate entry
    storeAddress: function(ipfsHash, mediaType, description) {
        let storageInstance;
        App.contracts.ipfsStorage.deployed().then(function(instance) {
            storageInstance = instance;
            let metaData = {from: App.account, to: storageInstance.address, gas: 300000}
            return storageInstance.storeMediaToIPFS.sendTransaction(ipfsHash, mediaType, description, metaData);        
        }).then(function(result) {
            console.log("Address successfully stored! Transaction hash:");
            console.log(result);
        }).catch(function(error) {
            console.log(error);
        });
    },

    
    fetchContent: function() {
        let storageInstance;
        App.contracts.ipfsStorage.deployed().then(function(instance) {
            storageInstance = instance;
            return storageInstance.getStoredDataSize().then(function(len) {
                //console.log("Storage Size: ", len.toNumber());
                let length = len.toNumber();
                for(let i = 0; i < length; i++) {
                    storageInstance.getStoredDataRecordAtIndex(i).then(function(record) {
                        console.log("Record("+ i +"): ", record);
                        
                        console.log("Content successfully retrieved! IPFS address:");
                        console.log(record[0]);
                        App.generateTableContent(record, i);
                    });
                }
            });
        });
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
    
        $(rowHTML).prependTo('#StoredContentTable tbody');
    }
},


$(function() {
    $(window).load(function() {
        App.init();
    });
});