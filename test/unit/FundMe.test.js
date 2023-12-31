const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config.js");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);

              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", async function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.s_priceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("fund", async function () {
              it("fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });
              it("update the amount of funded data", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });
              it("Adds funders to array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.s_funders(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });
              describe("Withdraw ETH from a single funder", async function () {
                  const startContractBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  console.log();
                  assert.equal(endingContractBalance, 0);
                  assert.equal(
                      startContractBalance.add(startDeployerBalance).toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("allow us to withdraw multiple funders", async function () {
                  const accounts = await ethers.getSigners();

                  for (let i = 0; i < 5; i++) {
                      const fundMeConnectedAccount = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedAccount.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  assert.equal(endingContractBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // Make sure funders reset properly
                  await expect(fundMe.s_funders(0)).to.be.reverted;
                  for (let i = 0; i < 5; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });
          });

          describe("cheaper withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });
              describe("Withdraw ETH from a single funder", async function () {
                  const startContractBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  console.log();
                  assert.equal(endingContractBalance, 0);
                  assert.equal(
                      startContractBalance.add(startDeployerBalance).toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("allow us to withdraw multiple funders", async function () {
                  const accounts = await ethers.getSigners();

                  for (let i = 0; i < 5; i++) {
                      const fundMeConnectedAccount = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedAccount.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  assert.equal(endingContractBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // Make sure funders reset properly
                  await expect(fundMe.s_funders(0)).to.be.reverted;
                  for (let i = 0; i < 5; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });
          });
      });
