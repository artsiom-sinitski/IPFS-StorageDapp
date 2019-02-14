pragma solidity ^0.5.0;

contract SimpleStorage {
    string public storedData;

    function setStoredData(string memory _data) public {
        storedData = _data;
    }
}