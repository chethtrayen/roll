import { expect } from "chai";
import { deployments, ethers } from "hardhat";
const ONE_GWEI = "1000000000";

const MUMBAI_API = "IJH86NT21AIUJ66AMI2GEEBVZ1DU7R2IFU"

describe("Lock", function () {

  let roll, vrfCoordinatorV2Mock 

  beforeEach(async () => {
    await deployments.fixture(["all", "mock"]);
    roll = await ethers.getContract("Roll");
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  });
  
  describe("Roll smart contract", () => {
    describe("Constructor", () => {
      it("should have the right amount in the bank", async () => {
        const bank = await roll.getBank();
        expect(bank.toString()).to.equal(ONE_GWEI);
      })
    })

    describe("Roll dice", () => {
      describe("Create bet and start randomization", () => {
        it("should create bet with a requestId", async () => {
          const requestId = await roll.rollDice(6, {value: "101"});
          expect(requestId).to.be.not.null;
        })

        it('get bet from requestId', async () => {
          try{
            roll.rollDice(6, {value: "101"});
            const requestId = await new Promise<number>((resolve, reject) => {
              try{
                roll.once("diceRoll", (requestId) => {                
                  resolve(requestId.toNumber());
                })
                
              }catch(e){
                reject(e);
              }
            })

            vrfCoordinatorV2Mock.fulfillRandomWords(requestId, roll.address)

            await new Promise<void>((resolve, reject) => {
              try{
                roll.once("rollCompleted", () => {                  
                  expect(true).to.be.true;
                  resolve();
                })
              }
              catch(e){
                reject(e)
              }
            })
          }catch(e){
            console.log(e)
          }
        })
         
      })
    })
  })
 
});
