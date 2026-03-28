const hre = require("hardhat");

async function main() {
  const Funding = await hre.ethers.getContractFactory("Funding");
  const funding = await Funding.deploy();
  await funding.waitForDeployment();

  const address = await funding.getAddress();
  console.log(`Funding deployed to: ${address}`);
  console.log("ABI available at: artifacts/contracts/Funding.sol/Funding.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
