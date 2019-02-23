pragma solidity ^0.5.0;

contract IpfsStorage {
    //************ STATE DATA ***************
    //***************************************

    //stores IPFS object's meta data
    struct IPFSmetaData {
        string mediaType;
        string description;
        uint32 index;     // from 0 .. 2^32 - 1 = 4,294,967,295
    }
    // array containing unordered list of IPFS addresses
    string[] private storedDataIndexes;
    // maps IPFS object's address to its meta data
    mapping(string => IPFSmetaData) private storedData;

    //*******EVENTS and MODIFIERS ************
    //****************************************
    event MediaStoredOnIPFS(string ipfsAddress, string mediaType, string description);

    //****** Contract Public Interface ******
    //***************************************
    constructor() public {}


    function storeMediaToIPFS(string memory _ipfsAddress,
                              string memory _mediaType,
                              string memory _description)
      public returns (bool success) {
        require(keyExists(_ipfsAddress) == false, "duplicate IPFS address!");

        storedData[_ipfsAddress].mediaType = _mediaType;
        storedData[_ipfsAddress].description = _description;
        storedData[_ipfsAddress].index = uint32(storedDataIndexes.push(_ipfsAddress) - 1);

        emit MediaStoredOnIPFS(_ipfsAddress, _mediaType, _description);
  
        return true;
    }


    function getStoredDataIndex(string memory _ipfsAddress)
      public view returns (int dataIndex) {
        require(keyExists(_ipfsAddress) == true, "The key is not found!");
        // if ( !keyExists(_ipfsAddress) )
        //   return -1;
        return storedData[_ipfsAddress].index;
    }

    function getStoredDataSize() 
      public view returns (uint32 len) {
          return uint32(storedDataIndexes.length);
    }

    
    function getStoredDataRecordAtIndex(uint32 _index)
      public view returns(string memory ipfsHash,
                          string memory mediaType,
                          string memory desc) {
        require(_index >= 0 && _index < storedDataIndexes.length);

        string memory key = storedDataIndexes[_index];
        IPFSmetaData memory r = storedData[key];
        
        return (key, r.mediaType, r.description);
    }


    function keyExists(string memory _key)
      public view returns (bool keyFound) {
        if ( storedDataIndexes.length <= 0 ) {
            return false;
        }
        bytes memory bk1 = bytes(storedDataIndexes[storedData[_key].index]);
        bytes memory _bk = bytes(_key);
        return (keccak256(_bk) == keccak256(bk1));
    }

}