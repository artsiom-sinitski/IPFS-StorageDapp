pragma solidity ^0.5.0;

contract SimpleStorage {
    string private storedData;

    function getStoredData() public view returns (string memory) {
        return storedData;
    }

    function setStoredData(string memory _data) public {
        storedData = _data;
    }
}