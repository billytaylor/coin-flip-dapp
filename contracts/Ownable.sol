pragma solidity 0.5.12;

contract Ownable{
    address public owner;

    modifier onlyOwner(){
        require(msg.sender == owner, "You are not contract owner!");
        _; //Continue execution
    }

    constructor() public{
        owner = msg.sender;
    }
}
