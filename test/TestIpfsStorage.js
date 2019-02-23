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
            assert.equal(len, 1, 'should be stored only a single IPFS hash');
            return storageInstance.storeMediaToIPFS(ipfsAddress1, mediaType1, desc1);
        }).then(assert.fail).catch(function(error) {//(function(receipt) {
            //assert.equal(receipt.logs.length, 0, 'no "MediaStoredOnIPFS" event trigerred');
            assert(error.message.indexOf('revert') >= 0, 'should NOT be able to add a duplicate content');
            return storageInstance.getStoredDataSize();
        }).then(function(len) {
            assert.equal(len.toNumber(), 1, 'array should have 1 IPFS hash only');
            return storageInstance.storeMediaToIPFS(ipfsAddress2, mediaType2, desc2);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers exactly one event');
            assert.equal(receipt.logs[0].event, 'MediaStoredOnIPFS', 'should be the "MediaStoredOnIPFS" event 2');
            assert.equal(receipt.logs[0].args.ipfsAddress, ipfsAddress2, 'logs the IPFS hash');
            return storageInstance.getStoredDataSize();
        }).then(function(len) {
            assert.equal(len.toNumber(), 2, 'should contain 2 IPFS hashes');
            return storageInstance.getStoredDataIndex("NonExistingKey1");
        }).then(assert.fail).catch(function(error) {
            //assert.equal(dataIndex.toNumber(), -1, 'this key should not exist');
            assert(error.message.indexOf('revert') >= 0, 'this key should not be found');
            return storageInstance.getStoredDataRecordAtIndex(1);
        }).then(function(result) {
            assert.equal(result.ipfsHash, ipfsAddress2, 'IPFS hash retrieved is not correct');
            assert.equal(result.mediaType, mediaType2, 'media type retrieved is not correct');
            assert.equal(result.desc, desc2, 'description retrieved is not correct');
            return storageInstance.keyExists(ipfsAddress1);
        }).then(function(keyFound) {
            assert.equal(keyFound, true, "this key1 should exist");
            return storageInstance.keyExists(ipfsAddress2);
        }).then(function(result) {
            assert.equal(result, true, "this key2 should exist");
            return storageInstance.keyExists("NonExistingKey");
        }).then(function(result) {
            assert.equal(result, false, "this key should NOT exist");
        }); 
    });

});