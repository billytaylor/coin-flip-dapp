import "./Ownable.sol";
import "./provableAPI.sol";
pragma solidity 0.5.12;

contract BillyCoinFlip is Ownable, usingProvable {

    event weHaveAWinner();
    event weHaveALoser();
    event debug(uint);

    uint public balance;
    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;

    event HeadOrTailsRequested(address addr, bytes32 queryId);
    event generatedHeadOrTails(bytes32 queryId, bool isHeads, uint winnings);

    struct Bet {
      address payable addr;
      uint256   betAmount;
    }

    mapping (bytes32 => Bet) private queryIdToBet;

    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
      //require(msg.sender == provable_cbAddress(), "Not from provable!");

      bool isHeads = uint256(keccak256(abi.encodePacked(_result))) % 2 == 0;
      Bet memory bet = queryIdToBet[_queryId];

      if (isHeads) { //they won! pay out their stake + winnings
          uint toTransfer = bet.betAmount * 2;
          balance -= toTransfer;
          require(balance >= 0, "Oops! Balance < 0 !!!"); // INVARIANT OR WE HAVE MUCKED UP
          bet.addr.transfer(toTransfer);
          emit generatedHeadOrTails(_queryId, isHeads, toTransfer);
      } else{
          emit generatedHeadOrTails(_queryId, isHeads, 0);
      }
      delete queryIdToBet[_queryId];
    }

    function getHeadsOrTails(Bet memory bet) private returns(bytes32) {
      uint256 QUERY_EXECUTION_DELAY = 0;
      uint256 GAS_FOR_CALLBACK = 200000;

      bytes32  queryId = testRandom(bet);
      /*
      bytes32 queryId = provable_newRandomDSQuery(
        QUERY_EXECUTION_DELAY,
        NUM_RANDOM_BYTES_REQUESTED,
        GAS_FOR_CALLBACK
      );
      queryIdToBet[queryId] = bet;
      */

      return queryId;
    }

    function testRandom(Bet memory bet) private returns (bytes32) {
      bytes32 queryId = bytes32(keccak256(abi.encodePacked(now)));
      queryIdToBet[queryId] = bet;
      __callback(queryId, (now%2==0) ? "0" : "1", bytes("test"));
      return queryId;
    }

    modifier costs(uint cost){
        require(msg.value >= cost, "can't place < minimum bet!");
        _;
    }

    function coinFlip() public payable costs(0.001 ether) returns(bytes32 queryId) {
        emit debug(msg.value);
        emit debug(balance);

        require(msg.value <= balance, "You can't bet more than the bank has!!!");

        balance += msg.value;

        Bet memory bet;
        bet.addr = msg.sender;
        bet.betAmount = msg.value;

        bytes32 _queryId = getHeadsOrTails(bet);
        emit HeadOrTailsRequested(msg.sender, _queryId);

        return _queryId;
    }

    function addToBank() public payable {
        balance += msg.value;
    }

    function getBankBalance() public view returns(uint){
        return balance;
    }

   function withdrawAll() public onlyOwner returns(uint) {
       uint toTransfer = balance;
       balance = 0;
       msg.sender.transfer(toTransfer);
       return toTransfer;
   }

}
