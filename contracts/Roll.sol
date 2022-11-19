pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

library GuessHandler {
  function withinRange(uint8 guess, uint256 result ) internal pure returns (bool) {
    return result == guess;
  }
}

library BetLib {
  struct Bet {
    address payable player;
    uint256 amount;
    uint8 guess;
    bool winner;
    bool completed;
  }

  function getBet(Bet memory bet) internal pure returns (address, uint256, uint8){
    return (bet.player, bet.amount, bet.guess);
  }
}

contract Roll is VRFConsumerBaseV2{
  using BetLib for BetLib.Bet;

  using GuessHandler for uint8;
  uint8 private constant DICE_SIDES = 6;

  address payable private immutable  i_owner;
  uint64 private s_minBet;
  uint256 private s_bank;
  mapping(uint256 => BetLib.Bet) bets;

  VRFCoordinatorV2Interface private immutable i_vrfCoordinatorV2;
  uint64 private immutable i_subscriptionId;
  bytes32 private immutable i_gasLane;
  uint32 private immutable i_callbackGasLimit;
  uint8 private constant REQUEST_CONFIRMATION = 3;
  uint8 private constant NUM_WORDS = 1;

  constructor(uint64 minBet, address vrfCoordinatorV2, uint64 subscriptionId, bytes32 gasLane, uint32 callbackGasLimit) VRFConsumerBaseV2(vrfCoordinatorV2) payable{
    i_owner = payable(msg.sender);
    s_minBet = minBet;
    s_bank = msg.value;

    i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_subscriptionId = subscriptionId;
    i_gasLane = gasLane;
    i_callbackGasLimit = callbackGasLimit;
  }

  error Roll__TransactionFailed();
  error Roll__InvalidGuess();
  error Roll__MinBetNotMet();
  error Roll__NotEnoughFund();
  error Roll__PermissionDenied();

  event rollCompleted(address indexed player, uint256 indexed requestId);
  event diceRoll(address indexed player, uint256 indexed requestId);
  event addToBank(uint256 indexed amount);

  modifier onlyOwner(){
    if(i_owner != msg.sender){
      revert Roll__PermissionDenied();
    }
    _;
  }
  
  modifier validGuess(uint8 guess){
    if(guess < 1 || guess > DICE_SIDES){
      revert Roll__InvalidGuess();
    }
    _;
  }

  modifier minBetAmount(){
    if(msg.value < s_minBet){
      revert Roll__MinBetNotMet();
    }
    _;
  }

  modifier checkBank(){
    if(s_bank <= msg.value){
      revert Roll__NotEnoughFund();
    }
    _;
  }

  function fundBank() public payable onlyOwner{
    s_bank += msg.value;
    emit addToBank(msg.value);
  }

  function recieve() external payable{
    fundBank();
  } 

  function rollDice(uint8 _guess) public payable checkBank validGuess(_guess) minBetAmount returns (uint256 requestId){
    requestId = i_vrfCoordinatorV2.requestRandomWords(i_gasLane, i_subscriptionId, REQUEST_CONFIRMATION, i_callbackGasLimit, NUM_WORDS);
    s_bank -= msg.value;
    bets[requestId]= BetLib.Bet(payable(msg.sender), msg.value, _guess, false, false);   
    emit diceRoll(msg.sender, requestId);
  }

  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override{
    uint256 diceResults = randomWords[0] % DICE_SIDES + 1;

    address payable player = bets[requestId].player;
    uint8 guess = bets[requestId].guess;
    uint256 amount = bets[requestId].amount;

    if(guess.withinRange(diceResults)){
      (bool success, ) = player.call{value: amount * 2}("");
  
      if(!success){
        revert Roll__TransactionFailed();
      }
      
      bets[requestId].winner = true;
    }else{
      s_bank += amount;
    }

    bets[requestId].completed = true;
    emit rollCompleted(player, requestId);
  }

  function getBank() external view returns(uint256){
    return s_bank;
  }

  function getMinBet() external view returns(uint256){
    return s_minBet;
  }

  function getBet(uint256 requestId) external view returns(address, uint256, uint8){
    return bets[requestId].getBet();
  }

}