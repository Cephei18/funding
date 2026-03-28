const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Funding", function () {
  async function deployFundingFixture() {
    const [owner, funder, recipient] = await ethers.getSigners();
    const Funding = await ethers.getContractFactory("Funding");
    const funding = await Funding.deploy();
    await funding.waitForDeployment();
    return { funding, owner, funder, recipient };
  }

  it("tracks incoming funds", async function () {
    const { funding, funder } = await deployFundingFixture();
    const amount = ethers.parseEther("1");

    await funding.connect(funder).fund({ value: amount });

    expect(await funding.totalFunded()).to.equal(amount);
    expect(await funding.lifetimeFunded()).to.equal(amount);
  });

  it("rejects zero-value funding", async function () {
    const { funding, funder } = await deployFundingFixture();

    await expect(funding.connect(funder).fund({ value: 0n })).to.be.revertedWith(
      "Send ETH to fund"
    );
  });

  it("allows owner to withdraw", async function () {
    const { funding, funder, recipient } = await deployFundingFixture();
    const amount = ethers.parseEther("0.5");

    await funding.connect(funder).fund({ value: amount });

    await expect(() => funding.withdraw(recipient.address)).to.changeEtherBalances(
      [funding, recipient],
      [-amount, amount]
    );
  });

  it("blocks non-owner withdraw", async function () {
    const { funding, funder, recipient } = await deployFundingFixture();

    await expect(
      funding.connect(funder).withdraw(recipient.address)
    ).to.be.revertedWith("Only owner can withdraw");
  });

  it("rejects zero recipient on withdraw", async function () {
    const { funding } = await deployFundingFixture();

    await expect(
      funding.withdraw(ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid recipient");
  });

  it("rejects withdraw when balance is empty", async function () {
    const { funding, recipient } = await deployFundingFixture();

    await expect(funding.withdraw(recipient.address)).to.be.revertedWith(
      "Nothing to withdraw"
    );
  });
});
