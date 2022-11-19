const { ethers, network } = require("hardhat");
const { networkSettings } = require("../network-config");

const FUND_AMOUNT = ethers.utils.parseEther("1");

module.exports = async ({ getNamedAccounts, deployments }) => {
  ONE_GWEI = "1000000000";
  let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;

  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  const {chainId} = network.config;
  const isDev = chainId === 31337;

  const {minBet, initialValue, gasLane, gasLimit} = networkSettings[chainId];
  
  if(isDev){
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const trxResponse = await vrfCoordinatorV2Mock.createSubscription();
    const trxReceipt = await trxResponse.wait(1);

    subscriptionId = trxReceipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  }else{
    ;({vrfCoordinatorV2Address, subscriptionId} = networkSettings[chainId])
  }

  const waitConfirmation = 1;

  const args = [
    minBet,
    vrfCoordinatorV2Address,
    subscriptionId,
    gasLane,
    gasLimit
  ]

   await deploy('Roll', {
    from: deployer, 
    args,
    log: true,
    value: initialValue,
    waitConfirmation
  });

  console.log(ethers.utils.parseEther("0.01").toString())
  if(isDev){
    const roll = await ethers.getContract("Roll");
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId.toNumber(), roll.address)
  }
}

module.exports.tags = ["all", "main"]

