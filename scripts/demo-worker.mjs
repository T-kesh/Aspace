/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              ASPACE — END-TO-END DEMO WORKER               ║
 * ║                                                              ║
 * ║  Demonstrates the full autonomous agent lifecycle on-chain: ║
 * ║  1. Register an AI agent on AgentRegistry                   ║
 * ║  2. Orchestrator discovers agent by capability              ║
 * ║  3. Orchestrator creates + funds a task in TaskEscrow       ║
 * ║  4. Agent autonomously picks up and completes the task      ║
 * ║  5. Final task state is read back from the blockchain       ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * USAGE:
 *   node scripts/demo-worker.mjs
 *
 * REQUIREMENTS:
 *   Set these env vars (or create a .env in this directory):
 *     AGENT_PRIVATE_KEY=0x...      (wallet that acts as the AI agent)
 *     ORCHESTRATOR_PRIVATE_KEY=0x...  (wallet that hires the agent)
 *
 *   Both wallets need:
 *     - A small amount of Kite AI ETH for gas
 *     - MockUSDC tokens (the orchestrator needs at least 5 USDC)
 *       Mint at: https://testnet-explorer.gokite.ai
 */

import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

// ─── Contract Addresses (Kite AI Testnet) ────────────────────────────────────
const CONTRACTS = {
  registry: "0x59E09856Ca9F15Fd770528e91760B54c982C185e",
  escrow:   "0x544f9D8a6564254cE90295fe307088A6F9497bE9",
  usdc:     "0x25534fF2742d7EfC8cf075500b78324be8637CA5",
};

const RPC_URL = "https://rpc-testnet.gokite.ai/";
const TASK_AMOUNT_USDC = 5; // USDC per task

// ─── ABIs (minimal) ───────────────────────────────────────────────────────────
const REGISTRY_ABI = [
  "function registerAgent(address agentAddress, string name, string description, string[] capabilities, uint256 pricePerTask)",
  "function updateAgent(address agentAddress, string name, string description, string[] capabilities, uint256 pricePerTask)",
  "function getAgent(address agentAddress) view returns ((address owner, string name, string description, string[] capabilities, uint256 pricePerTask, uint256 reputationScore, bool isActive, uint256 totalTasksCompleted, uint256 registrationTime))",
  "function getAgentsByCapability(string capability) view returns (address[])",
  "event AgentRegistered(address indexed agentAddress, string name, address indexed owner)",
];

const ESCROW_ABI = [
  "function createTask(address provider, uint256 amount, string taskData) returns (uint256)",
  "function fundTask(uint256 taskId, uint256 amount)",
  "function startTask(uint256 taskId)",
  "function completeTask(uint256 taskId, string taskOutput)",
  "function getTask(uint256 taskId) view returns ((uint256 taskId, address client, address provider, uint256 amount, string taskData, string taskOutput, uint8 status, uint256 createdAt, uint256 fundedAt, uint256 completedAt, uint256 verifiedAt, uint256 paidAt))",
  "function nextTaskId() view returns (uint256)",
  "event TaskCreated(uint256 indexed taskId, address indexed client, address provider, uint256 amount)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function mint(address to, uint256 amount)",
];

const STATUS_LABELS = ["Created", "Funded", "InProgress", "Completed", "Verified", "Paid", "Refunded", "Cancelled"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function separator(title = "") {
  const line = "─".repeat(60);
  if (title) {
    const pad = Math.max(0, Math.floor((60 - title.length - 2) / 2));
    console.log(`\n${"─".repeat(pad)} ${title} ${"─".repeat(60 - pad - title.length - 2)}`);
  } else {
    console.log(`\n${line}`);
  }
}

function shortAddr(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

async function waitTx(txPromise, label) {
  process.stdout.write(`  ⏳ ${label}... `);
  const tx = await txPromise;
  const receipt = await tx.wait();
  console.log(`✅  (${receipt.hash.slice(0, 10)}...)`);
  return receipt;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║             ASPACE DEMO — AUTONOMOUS AGENT LOOP             ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`  Network : Kite AI Testnet (chainId 2368)`);
  console.log(`  RPC     : ${RPC_URL}`);

  // ── Validate env ────────────────────────────────────────────────────────────
  const agentKey = process.env.AGENT_PRIVATE_KEY;
  const orchKey  = process.env.ORCHESTRATOR_PRIVATE_KEY;

  if (!agentKey || !orchKey) {
    console.error("\n❌  Missing environment variables!");
    console.error("   Please set AGENT_PRIVATE_KEY and ORCHESTRATOR_PRIVATE_KEY.");
    console.error("   Example (in project root .env):");
    console.error("     AGENT_PRIVATE_KEY=0xabc...");
    console.error("     ORCHESTRATOR_PRIVATE_KEY=0xdef...\n");
    process.exit(1);
  }

  // ── Setup providers / signers ────────────────────────────────────────────────
  const provider     = new ethers.JsonRpcProvider(RPC_URL);
  const agentWallet  = new ethers.Wallet(agentKey, provider);
  const orchWallet   = new ethers.Wallet(orchKey, provider);

  separator("WALLETS");
  console.log(`  🤖 Agent       : ${agentWallet.address}`);
  console.log(`  🎯 Orchestrator: ${orchWallet.address}`);

  // ── Contracts ────────────────────────────────────────────────────────────────
  const registry = new ethers.Contract(CONTRACTS.registry, REGISTRY_ABI, agentWallet);
  const escrow   = new ethers.Contract(CONTRACTS.escrow, ESCROW_ABI, orchWallet);
  const escrowAsAgent = new ethers.Contract(CONTRACTS.escrow, ESCROW_ABI, agentWallet);
  const usdc     = new ethers.Contract(CONTRACTS.usdc, ERC20_ABI, orchWallet);

  // ── Check balances ────────────────────────────────────────────────────────────
  separator("BALANCES");
  const agentEth = ethers.formatEther(await provider.getBalance(agentWallet.address));
  const orchEth  = ethers.formatEther(await provider.getBalance(orchWallet.address));
  const orchUsdc = Number(ethers.formatUnits(await usdc.balanceOf(orchWallet.address), 6));

  console.log(`  🤖 Agent  ETH  : ${agentEth}`);
  console.log(`  🎯 Orch   ETH  : ${orchEth}`);
  console.log(`  🎯 Orch   USDC : ${orchUsdc.toFixed(2)}`);

  if (parseFloat(agentEth) < 0.001) {
    console.error("\n❌ Agent wallet has insufficient ETH for gas. Fund it from the Kite AI faucet.");
    process.exit(1);
  }
  if (parseFloat(orchEth) < 0.001) {
    console.error("\n❌ Orchestrator wallet has insufficient ETH for gas.");
    process.exit(1);
  }
  if (orchUsdc < TASK_AMOUNT_USDC) {
    console.log(`\n  💡 Orchestrator has insufficient MockUSDC (${orchUsdc} USDC < ${TASK_AMOUNT_USDC} needed).`);
    console.log(`  🪙 Minting ${TASK_AMOUNT_USDC * 10} MockUSDC to orchestrator...`);
    const mintAmount = ethers.parseUnits(String(TASK_AMOUNT_USDC * 10), 6);
    await waitTx(usdc.mint(orchWallet.address, mintAmount), "Minting MockUSDC");
    const newBal = Number(ethers.formatUnits(await usdc.balanceOf(orchWallet.address), 6));
    console.log(`  ✅ New USDC balance: ${newBal.toFixed(2)}`);
  }

  // ── STEP 1: Register Agent ────────────────────────────────────────────────────
  separator("STEP 1 — AGENT REGISTRATION");
  console.log(`  🤖 Registering "Aspace Demo Agent" with capability: "text-summarization"`);

  const pricePerTask = ethers.parseUnits(String(TASK_AMOUNT_USDC), 6);
  try {
    await waitTx(
      registry.registerAgent(
        agentWallet.address,
        "Aspace Demo Agent",
        "An autonomous AI agent that summarizes text on the Aspace network.",
        ["text-summarization", "nlp"],
        pricePerTask
      ),
      "Registering agent on-chain"
    );
  } catch (err) {
    if (err.message?.includes("AgentAlreadyRegistered")) {
      console.log(`  ℹ️  Agent already registered. Updating metadata...`);
      await waitTx(
        registry.updateAgent(
          agentWallet.address,
          "Aspace Demo Agent",
          "An autonomous AI agent that summarizes text on the Aspace network.",
          ["text-summarization", "nlp"],
          pricePerTask
        ),
        "Updating agent on-chain"
      );
    } else {
      throw err;
    }
  }

  const agentInfo = await registry.getAgent(agentWallet.address);
  console.log(`  ✅ Agent confirmed on-chain:`);
  console.log(`     Name       : ${agentInfo[1]}`);
  console.log(`     Capabilities: ${[...agentInfo[3]].join(", ")}`);
  console.log(`     Price/Task : ${ethers.formatUnits(agentInfo[4], 6)} USDC`);
  console.log(`     Active     : ${agentInfo[6]}`);

  // ── STEP 2: Orchestrator discovers agent ──────────────────────────────────────
  separator("STEP 2 — CAPABILITY DISCOVERY");
  const registryReadOnly = new ethers.Contract(CONTRACTS.registry, REGISTRY_ABI, provider);
  const matches = await registryReadOnly.getAgentsByCapability("text-summarization");
  console.log(`  🔍 Agents with "text-summarization" capability: ${matches.length}`);
  matches.forEach((addr, i) => console.log(`     [${i + 1}] ${shortAddr(addr)}`));

  // ── STEP 3: Create + Fund Task ────────────────────────────────────────────────
  separator("STEP 3 — TASK CREATION & FUNDING");
  const taskPrompt = "Summarize the key innovations in the Aspace decentralized AI agent marketplace. Focus on: on-chain escrow, autonomous task execution, and trustless payments.";
  console.log(`  📝 Task prompt: "${taskPrompt.slice(0, 80)}..."`);

  // Create task
  const createTx = await escrow.createTask(
    agentWallet.address,
    ethers.parseUnits(String(TASK_AMOUNT_USDC), 6),
    taskPrompt
  );
  const createReceipt = await createTx.wait();
  console.log(`  ✅ Task created (tx: ${createReceipt.hash.slice(0, 10)}...)`);

  // Parse taskId from event
  let taskId = 0;
  const iface = new ethers.Interface(ESCROW_ABI);
  for (const log of createReceipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "TaskCreated") {
        taskId = Number(parsed.args.taskId);
        break;
      }
    } catch (_) {}
  }
  if (taskId === 0) {
    const nextId = await escrow.nextTaskId();
    taskId = Number(nextId) - 1;
  }
  console.log(`  🆔 Task ID: #${taskId}`);

  // Approve + Fund
  await waitTx(
    usdc.approve(CONTRACTS.escrow, ethers.parseUnits(String(TASK_AMOUNT_USDC), 6)),
    "Approving USDC allowance"
  );
  await waitTx(
    escrow.fundTask(taskId, ethers.parseUnits(String(TASK_AMOUNT_USDC), 6)),
    `Funding task #${taskId} escrow`
  );

  const fundedTask = await escrow.getTask(taskId);
  console.log(`  💰 Task #${taskId} status: ${STATUS_LABELS[Number(fundedTask[6])]} | Amount: ${ethers.formatUnits(fundedTask[3], 6)} USDC`);

  // ── STEP 4: Agent autonomous execution ───────────────────────────────────────
  separator("STEP 4 — AUTONOMOUS AGENT EXECUTION");
  console.log(`  🤖 Agent ${shortAddr(agentWallet.address)} picks up task #${taskId}...`);

  // Accept task (set InProgress)
  await waitTx(escrowAsAgent.startTask(taskId), `Starting task #${taskId} on-chain`);

  // Simulate AI work (in a real agent this would call an LLM API)
  console.log(`  🧠 Agent processing task (simulated AI work)...`);
  await new Promise(r => setTimeout(r, 1500));

  const agentOutput = [
    "ASPACE KEY INNOVATIONS SUMMARY:",
    "",
    "1. ON-CHAIN ESCROW: TaskEscrow.sol holds USDC in a trustless smart contract",
    "   until task completion is verified, eliminating payment fraud between agents.",
    "",
    "2. AUTONOMOUS TASK EXECUTION: The AspaceAgent SDK enables AI workers to",
    "   self-register, scan the blockchain for assigned tasks, execute custom logic,",
    "   and submit results — all without human intervention.",
    "",
    "3. TRUSTLESS PAYMENTS: Once a task is marked Completed, any party can trigger",
    "   releasePayment(), sending USDC directly to the provider's wallet via the",
    "   AgentRegistry's verified address mapping.",
    "",
    `[Processed by: ${agentWallet.address}]`,
    `[Task ID: #${taskId} | Kite AI Testnet | ${new Date().toISOString()}]`
  ].join("\n");

  console.log(`  📝 Agent output generated (${agentOutput.length} chars)`);

  // Complete task
  await waitTx(
    escrowAsAgent.completeTask(taskId, agentOutput),
    `Submitting output for task #${taskId}`
  );

  // ── STEP 5: Final state verification ─────────────────────────────────────────
  separator("STEP 5 — FINAL STATE VERIFICATION");
  const finalTask = await escrow.getTask(taskId);
  const finalStatus = STATUS_LABELS[Number(finalTask[6])];

  console.log(`  📋 Task #${taskId} Final State:`);
  console.log(`     Status    : ${finalStatus}`);
  console.log(`     Client    : ${shortAddr(finalTask[1])}`);
  console.log(`     Provider  : ${shortAddr(finalTask[2])}`);
  console.log(`     Amount    : ${ethers.formatUnits(finalTask[3], 6)} USDC`);
  console.log(`     Completed : ${new Date(Number(finalTask[9]) * 1000).toLocaleString()}`);
  console.log(`\n  📤 Task Output (first 200 chars):`);
  console.log(`     "${finalTask[5].slice(0, 200)}..."`);

  console.log(`\n  🔗 View on explorer:`);
  console.log(`     https://testnet-explorer.gokite.ai/address/${CONTRACTS.escrow}`);

  separator();
  if (finalStatus === "Completed") {
    console.log("  🎉  DEMO COMPLETE — Full autonomous agent loop executed on-chain!");
    console.log("  ✅  Agent registered → Task created → Task funded → Agent executed → Task completed");
  } else {
    console.log(`  ⚠️  Unexpected final status: ${finalStatus}`);
  }
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ Demo failed:", err.message ?? err);
  process.exit(1);
});
