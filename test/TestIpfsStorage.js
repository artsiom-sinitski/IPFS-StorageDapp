var IpfsStorage = artifacts.require("./IpfsStorage.sol");

contract('IpfsStorage', function(accounts) {
    let ipfsAddress1 = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";
    let ipfsAddress2 = "QmWmyoMoctfbAaiEs2GFLRHEUIPH8afierertdfHRE1243";

    let mediaType1 = "image";
    let mediaType2 = "video";

    let desc1 = "Test description";
    let desc2 = "Description2";

    it('tests the basic functionality of the storage contract', function() {
        return IpfsStorage.deployed().then(function(instance) {
            storageInstance = instance;
            return storageInstance.storeMediaToIPFS(ipfsAddress1, mediaType1, desc1);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers exactly one event');
            assert.equal(receipt.logs[0].event, 'MediaStoredOnIPFS', 'should be the "MediaStoredOnIPFS" event');
            assert.equal(receipt.logs[0].args.ipfsAddress, ipfsAddress1, 'logs the IPFS hash');
            return storageInstance.getStoredDataSize();
        }).then(function(len) {
            assert.equal(len, 1, 'should be stored only a single IPFS hash')
            return storageInstance.getStoredDataType(ipfsAddress1);
        }).then(function(result) {
            assert.equal(result.toString(), mediaType1, 'has the correct media type 1');
            return storageInstance.getStoredDataDescription(ipfsAddress1);
        }).then(function(result) {
            assert.equal(result.toString(), desc1, 'has the correct media description 1');
            return storageInstance.storeMediaToIPFS(ipfsAddress1, mediaType1, desc1);
        }).then(function(receipt) {
            //console.log("store again Result: ", receipt);
            assert.equal(receipt.logs.length, 0, 'no "MediaStoredOnIPFS" event trigerred');
            return storageInstance.getStoredDataSize();
        }).then(function(len) {
            assert.equal(len.toNumber(), 1, 'should still be stored only a single IPFS hash')
            return storageInstance.storeMediaToIPFS(ipfsAddress2, mediaType2, desc2);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers exactly one event');
            assert.equal(receipt.logs[0].event, 'MediaStoredOnIPFS', 'should be the "MediaStoredOnIPFS" event 2');
            assert.equal(receipt.logs[0].args.ipfsAddress, ipfsAddress2, 'logs the IPFS hash');
            return storageInstance.getStoredDataSize();
        }).then(function(len) {
            assert.equal(len.toNumber(), 2, 'should now be stored 2 IPFS hashes');
            return storageInstance.getStoredDataType(ipfsAddress2);
        }).then(function(result) {
            assert.equal(result.toString(), mediaType2, 'has the correct media type 2');
            return storageInstance.getStoredDataDescription(ipfsAddress2);
        }).then(function(result) {
            assert.equal(result.toString(), desc2, 'has the correct media description 2');
        })
        
    });

});