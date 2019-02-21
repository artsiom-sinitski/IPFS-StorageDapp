pragma solidity ^0.5.0;

contract IpfsStorage {
    //************ STATE DATA ***************
    //***************************************

    //stores IPFS object's meta data
    struct IPFSmetaData {
        string mediaType;
        string description;
        uint32 index;     // from 0 .. 2^32 - 1 = 4,294,967,295
        bool isExisting;  // for verifying key existence
    }
    // array containing unordered list of IPFS addresses
    string[] private storedDataIndexes;
    // maps IPFS object's address to its meta data
    mapping(string => IPFSmetaData) private storedData;
    address owner;

    //*******EVENTS and MODIFIERS ************
    //****************************************
    event MediaStoredOnIPFS(string ipfsAddress, string mediaType, string description);

    // modifier beExisting(string memory _ipfsAddress) {
    //     require(keyExists(_ipfsAddress) == true, "IPFS address not found!");
    //     _;
    // }
    //****** Contract Public Interface ******
    //***************************************
    constructor() public {
      owner = msg.sender;
    }


    function storeMediaToIPFS(string memory _ipfsAddress,
                              string memory _mediaType,
                              string memory _description)
      public returns (bool success) {
        require(msg.sender == owner);
        require(keyExists(_ipfsAddress) == false, "duplicate IPFS address!");
        //if (!keyExists(_ipfsAddress)) {
        storedData[_ipfsAddress].mediaType = _mediaType;
        storedData[_ipfsAddress].description = _description;
        //the '.push' method will return the new length of array
        storedData[_ipfsAddress].index = uint32(storedDataIndexes.push(_ipfsAddress) - 1);
        storedData[_ipfsAddress].isExisting = true; 
        emit MediaStoredOnIPFS(_ipfsAddress, _mediaType, _description);
            //return true;
        //}
        return true;
    }

    function getStoredDataType(string memory _ipfsAddress)
      public view returns (string memory dataType) {
        //require(keyExists(_ipfsAddress) == true, "Key doesn't exist!");
        if ( !keyExists(_ipfsAddress) )
          return "null";
        return storedData[_ipfsAddress].mediaType;
    }

    function getStoredDataDescription(string memory _ipfsAddress)
      public view returns (string memory dataDescription) {
        //require(keyExists(_ipfsAddress) == true, "Key doesn't exist!");
        if ( !keyExists(_ipfsAddress) )
          return "null";
        return storedData[_ipfsAddress].description;
    }

    function getStoredDataIndex(string memory _ipfsAddress)
      public view returns (int dataIndex) {
        /*  Keep getting the error below while unit testing =>
         *  "Error: Returned values aren't valid, did it run Out of Gas?"
         *  so instead of using the 'require' method, use if's
         */
        //require(keyExists(_ipfsAddress) == true, "Key doesn't exist!");
        if ( !keyExists(_ipfsAddress) )
          return -1;
        return storedData[_ipfsAddress].index;
    }

    function getStoredDataSize() 
      public view returns (uint32 len) {
          return uint32(storedDataIndexes.length);
    }

    function getStoredKey(uint32 _index)
      public view returns (string memory ipfsHash) {
        //require(_index >= 0 && _index < storedDataIndexes.length - 1, "Invalid index!");
        if (_index <= 0 || _index > storedDataIndexes.length - 1 )
          return "null";
        return storedDataIndexes[_index];
    }

    
    function getStoredDataRecordAtIndex(uint32 _index) public view
     returns(string memory ipfsHash, string memory mediaType, string memory desc) {
        require(_index >= 0 && _index < storedDataIndexes.length);

        string memory key = storedDataIndexes[_index];
        IPFSmetaData memory r = storedData[key];
        
        return (key, r.mediaType, r.description);
    }


    //****** Contract Private Methods *******
    //***************************************
    function keyExists(string memory _key)
     private view returns (bool keyFound) {
        if ( storedDataIndexes.length <= 0 ||
            !storedData[_key].isExisting ) {
            return false;
        }
        bytes memory bk1 = bytes(storedDataIndexes[storedData[_key].index]);
        bytes memory _bk = bytes(_key);
        return (keccak256(_bk) == keccak256(bk1));
    }

}