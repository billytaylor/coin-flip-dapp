var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi, '0xe5d18679783d00d1665f518a182c7817484f75c6', {from: accounts[0]});
      console.log(contractInstance);
      updateBalances();
    }, console.log);

    $('#place_bet_button').click(flipPressed);
    $('#load_bank_button').click(loadUpTheBank);

    $('#flip_spinner').css("display","none");
    $('#bank_spinner').css("display","none");
});

function loadUpTheBank() {
  var config = {
      value: web3.utils.toWei("0.1", "ether")
  }

  $('#bank_spinner').css("display","inline-block");
  contractInstance.methods.addToBank()
    .send(
      config,
      function(err,res) {
        if (err) {
          $('#bank_spinner').css("display","none");
        }
      }
    )
    .then(function(receipt){
      $('#bank_spinner').css("display","none");
      updateBalances();
      $('#flip_result_output').text("Thanks, you sent 0.1 ETH to the bank ;-)!");
      $('#win_output').text("");
    });
  //   console.log(receipt.events.weHaveAWinner);
  //   console.log(receipt.events.weHaveALoser);
  //   handleFlip(bet, receipt.events.weHaveAWinner ? true : false)
  // })
}

function updateBalances() {
  var bankBalance;
  var myBalance;

  contractInstance.methods.getBankBalance().call()
  .then(function(res){
    $('#bank_balance_output').text(web3.utils.fromWei(bankBalance=res));

    web3.eth.getBalance(contractInstance.options.from)
    .then(function(res){
      $('#my_balance_output').text(web3.utils.fromWei(myBalance=res));
      console.log(bankBalance);
      console.log(myBalance);
      console.log(Math.min(myBalance, bankBalance));
      $('#max_bet_output').text(web3.utils.fromWei(String(Math.min(myBalance, bankBalance))));

      console.log($('#bet_input').val())
    })

  });
}

function handleFlip(bet, isHeads)
{
  console.log(bet);
  console.log(isHeads);

  if (isHeads){
    $('#flip_result_output').text("The coin landed on Heads - YOU WIN!!!");
    $('#win_output').text("You won "+bet+" ETH!");
  } else {
    $('#flip_result_output').text("The coin landed on Tails - you lost. Better luck next time!");
    $('#win_output').text("");
  }
  updateBalances();
}

function flipPressed() {
  var bet = $('#bet_input').val();

  var config = {
    value: web3.utils.toWei(bet, "ether")
  }

  // Listen for result events
  $('#flip_spinner').css("display", "inline-block");
  contractInstance.once('generatedHeadOrTails', {filter: {addr: contractInstance.options.from}},
    function(err,res){
      $('#flip_spinner').css("display","none");
      if (err) {
        console.log(err);
        handleFlip("0", false);
      } else {
        console.log("winnings:");
        console.log(res.returnValues.winnings);

        var winnings = web3.utils.fromWei(res.returnValues.winnings);
        console.log("*** Did we win? ",res.returnValues.isHeads, " we won ", winnings);
        handleFlip(winnings, res.returnValues.isHeads);
      }
    });

  contractInstance.methods.coinFlip().send(
    config,
    function(err, res){
      if (err){
        console.log(err);
        $('#flip_spinner').css("display","none");
      }
    });
  // .then(function(receipt){
  //   console.log(receipt.events.weHaveAWinner);
  //   console.log(receipt.events.weHaveALoser);
  //   handleFlip(bet, receipt.events.weHaveAWinner ? true : false)
  // })
}

function getData() {
  contractInstance.methods.getPerson().call()
    .then(function(res){
      console.log(res);
      $('#name_output').text(res.name);
      $('#age_output').text(res.age);
      $('#height_output').text(res.height);
    });
}
