var IpfsStorage = artifacts.require("./IpfsStorage.sol");

contract('IpfsStorage', function(accounts) {
    let invalidIPFSaddress = "Qmb75_57VmV";
    let ipfsAddress = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";

    let mediaType1 = "image";
    //let mediaType2 = "video";

    let desc1 = "Test description";
    let desc2 = "Description2";

    it('tests the basic functionality of the storage contract', function() {
        return IpfsStorage.deployed().then(function(instance) {
            storageInstance = instance;
            return storageInstance.storeMediaToIPFS(ipfsAddress, desc1);
        /*}).then(assert.fail).catch(function(error) {
            console.log("Error: ", error);
            assert.equal(error.message.indexOf('Error') >= 0, 'IPFS address must be 46 characters long!');
            storageInstance.storeMediaToIPFS(ipfsAddress, desc1);
        /*}).then(assert.fail).catch(function(error) {
            console.log("Error: ", error);
            assert.equal(error.message.indexOf('revert') >= 0, 'IPFS address already exists!'); */
        }).then(function(result) {
            //console.log("Result:", result);
            console.log("Reslt->Logs->args ", result.logs[0].args);
            //console.log("Reslt->logs[0]->args[0]: ", result.logs[0].args.keyIndex);
            let arrSize = (result.logs[0].args.keyIndex).toNumber() + 1;
            assert.equal(arrSize, 1, 'indexes array has the correct size');
            return storageInstance.getStoredDataType(ipfsAddress);
        }).then(function(result) {
            //console.log("dataType: ", result);
            assert.equal(result.toString(), mediaType1, 'has the correct media type');
            return storageInstance.getStoredDataDescription(ipfsAddress);
        }).then(function(result) {
            //console.log("Description: ", result);
            assert.equal(result.toString(), desc1, 'has the correct media description');
        })
    });

});