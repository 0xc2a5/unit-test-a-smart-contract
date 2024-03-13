
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory('Faucet');
    const faucet = await Faucet.deploy();

    const [owner, otherAccount] = await ethers.getSigners();

    let withdrawAmount = ethers.parseEther("1");

    console.log('Signer 1 address: ', owner.address);
    return { faucet, owner, otherAccount, withdrawAmount };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdrawals over 0.1 ETH at a time', async function () {
    const { faucet, withdrawAmount } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });

  it('should only allow owner to call withdrawAll and destroyFaucet', async function () {
    const { faucet, otherAccount } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.connect(otherAccount).withdrawAll()).to.be.reverted;
    await expect(faucet.connect(otherAccount).destroyFaucet()).to.be.reverted;
    await expect(faucet.withdrawAll()).to.not.be.reverted;
    await expect(faucet.destroyFaucet()).to.not.be.reverted;
  });

  it('should delete contract after calling destroyFaucet', async function () {
    const { faucet } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.getDeployedCode()).to.not.be.null;
    await faucet.destroyFaucet();
    expect(await faucet.getDeployedCode()).to.be.null;
  });


  it('should set Faucet balance to 0 after calling withdrawAll', async function () {
    const { faucet } = await loadFixture(deployContractAndSetVariables);

    await faucet.withdrawAll();
    expect(await ethers.provider.getBalance(faucet.target)).to.equal(0);
  });
});