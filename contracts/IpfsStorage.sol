pragma solidity ^0.5.0;

contract IpfsStorage {
    //************ STATE DATA ***************
    //***************************************

    //stores IPFS object's meta data
    struct IPFSmetaData {
        string mediaType;
        string description;
        uint32 index; // 2^32 = 4,294,967,296
    }
    // array containing unordered list of IPFS addresses
    string[] private storedDataIndexes;
    // maps IPFS object's address to its meta data
    mapping(string => IPFSmetaData) private storedData;


    //*******EVENTS and MODIFIERS ************
    //****************************************
    event MediaStoredOnIPFS(string ipfsAddress, uint32 keyIndex);

    modifier beValid(string memory _ipfsAddress) {
        //string to bytes conversion for 'free' functionality
        bytes memory s = bytes(_ipfsAddress);
        uint32 ipfsHashSize = uint32(s.length);
        // length of IPFS hash should be 46 bytes
        require(ipfsHashSize == 46);
        _;
    }

    modifier beExisting(string memory _ipfsAddress) {
        require(keyExists(_ipfsAddress) == true, "IPFS address not found!");
        _;
    }
    //****** Contract Public Interface ******
    //***************************************
    constructor() public {}

    //TO DO: add the 'type' field
    function storeMediaToIPFS(string memory _ipfsAddress, 
                           string memory _description)
      public beValid(_ipfsAddress)
     returns (uint32 keyIndex) {
        require(keyExists(_ipfsAddress) == false, "duplicate IPFS address!");
        //store the IPFS object in the mapping
        storedData[_ipfsAddress].mediaType = "image";
        storedData[_ipfsAddress].description = _description;
        //the '.push' method will return the new length of array
        storedData[_ipfsAddress].index = uint32(storedDataIndexes.push(_ipfsAddress) - 1);
        emit MediaStoredOnIPFS(_ipfsAddress, keyIndex);
        return keyIndex;
    }

    function getStoredDataType(string memory _ipfsAddress)
      public view beValid(_ipfsAddress)
                  beExisting(_ipfsAddress)
     returns (string memory dataType) {
        return storedData[_ipfsAddress].mediaType;
    }

    function getStoredDataDescription(string memory _ipfsAddress)
      public view beValid(_ipfsAddress)
                  beExisting(_ipfsAddress)
     returns (string memory dataDescription) {
        return storedData[_ipfsAddress].description;
    }

    function getStoredDataIndex(string memory _ipfsAddress)
      public view beValid(_ipfsAddress)
                  beExisting(_ipfsAddress)
     returns (uint32 dataIndex) {
        return storedData[_ipfsAddress].index;
    }

    //****** Contract Public Interface ******
    //***************************************
    function keyExists(string memory _key) private view returns (bool keyFound) {
        if (storedDataIndexes.length <= 0 ) {
            return false;
        }
        bytes memory bk1 = bytes(storedDataIndexes[storedData[_key].index]);
        bytes memory _bk = bytes(_key);
        return (keccak256(_bk) == keccak256(bk1));
    }
}