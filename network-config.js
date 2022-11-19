const VERFICATION_CONFIRMATION = 6;



const networkSettings = {
  31337: {
    minBet: "100",
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    gasLimit: "2500000",
    initialValue: "1000000000"
  },
  80001 : {
    minBet: ethers.utils.parseEther("0.01"),
    vrfCoordinatorV2Address: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    subscriptionId: 2187,
    gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    gasLimit: "2500000"
  }
}



module.exports = {
  networkSettings,
  VERFICATION_CONFIRMATION
}