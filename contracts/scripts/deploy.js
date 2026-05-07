const hre = require("hardhat");

async function main() {
  console.log("Deploying Aspace contracts...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MockUSDC (for testing, replace with real USDC on mainnet)
  console.log("Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdcToken = await MockUSDC.deploy("USD Coin", "USDC");
  await usdcToken.waitForDeployment();
  const usdcAddress = await usdcToken.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // Deploy AgentRegistry
  console.log("Deploying AgentRegistry...");
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy(deployer.address);
  await agentRegistry.waitForDeployment();
  const registryAddress = await agentRegistry.getAddress();
  console.log("AgentRegistry deployed to:", registryAddress);

  // Deploy TaskEscrow
  console.log("Deploying TaskEscrow...");
  const TaskEscrow = await hre.ethers.getContractFactory("TaskEscrow");
  const taskEscrow = await TaskEscrow.deploy(
    usdcAddress,
    deployer.address,
    200, // 2% platform fee
    deployer.address // fee recipient
  );
  await taskEscrow.waitForDeployment();
  const escrowAddress = await taskEscrow.getAddress();
  console.log("TaskEscrow deployed to:", escrowAddress);

  // Deploy Verifier
  console.log("Deploying Verifier...");
  const Verifier = await hre.ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy(deployer.address);
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("Verifier deployed to:", verifierAddress);

  // Deploy Reputation
  console.log("Deploying Reputation...");
  const Reputation = await hre.ethers.getContractFactory("Reputation");
  const reputation = await Reputation.deploy(deployer.address);
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("Reputation deployed to:", reputationAddress);

  // Configure contract integrations
  console.log("Configuring contract integrations...");

  // Set AgentRegistry in Reputation
  await reputation.setAgentRegistry(registryAddress);
  console.log("AgentRegistry set in Reputation");

  // Set TaskEscrow in Reputation
  await reputation.setTaskEscrow(escrowAddress);
  console.log("TaskEscrow set in Reputation");

  // Set Verifier in TaskEscrow
  await taskEscrow.setVerifierContract(verifierAddress);
  console.log("Verifier set in TaskEscrow");

  // Set Reputation in TaskEscrow (for auto-updates)
  await taskEscrow.setReputationContract(reputationAddress);
  console.log("Reputation set in TaskEscrow");

  // Authorize deployer as verifier (for testing)
  await verifier.authorizeVerifier(deployer.address);
  console.log("Deployer authorized as verifier");

  // Mint initial USDC to deployer
  await usdcToken.mint(deployer.address, hre.ethers.parseUnits("1000000", 6));
  console.log("Minted 1M USDC to deployer");

  // Save deployment addresses
  const deploymentAddresses = {
    network: (await hre.ethers.provider.getNetwork()).name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      MockUSDC: usdcAddress,
      AgentRegistry: registryAddress,
      TaskEscrow: escrowAddress,
      Verifier: verifierAddress,
      Reputation: reputationAddress
    },
    deployedAt: new Date().toISOString()
  };

  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentAddresses, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));

  // Save to file
  const fs = require("fs");
  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentAddresses, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2)
  );
  console.log("\nDeployment addresses saved to deployments.json");

  return deploymentAddresses;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
