pragma solidity  >=0.5.8;

contract ContractFactory {
  function createInstance() public {
    new HelloWorld();
  }
}

contract HelloWorld {
  string public message;
  constructor() public {
    message = "hello";
  }
  function setMessage(string memory newMessage) public {
    message = newMessage;
  }
}