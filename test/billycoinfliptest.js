const BillyCoinFlip=artifacts.require("BillyCoinFlip");
const truffleAssert = require("truffle-assertions");

contract("BillyCoinFlip", async function(accounts) {

  let instance;

  before(async function(){
    instance = await BillyCoinFlip.deployed();
    instance.addToBank({value: web3.utils.toWei("1", "ether")});
    // instance = await People.new();
  });


  beforeEach(async function(){
     //instance = await BillyCoinFlip.deployed();
  });

  after(async function(){
     instance.withdrawAll();
  });

  //after()
  //afterEach()


  it("should allow a bet >= 0.001 ether", async function() {
    //let instance = await People.deployed();
    console.log(await instance.coinFlip({value: web3.utils.toWei("0.001", "ether")}));
  });

  it("shouldn't allow a bet < 0.001 ether", async function() {
    //let instance = await People.deployed();
    //let balance = parseFloat(await instance.getBankBalance());
    await truffleAssert.fails(
      instance.coinFlip({value: web3.utils.toWei("0.000999", "ether")}),
      truffleAssert.ErrorType.REVERT);
  });

  it("shouldn't allow a bet bigger than the bank balance", async function() {
    //let instance = await People.deployed();
    let balance = await instance.getBankBalance();
    await truffleAssert.fails(
      instance.coinFlip({value: balance+1}),
      truffleAssert.ErrorType.REVERT);
  });

})
