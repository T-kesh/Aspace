import { ethers } from "ethers";

const RPC_URL = process.env.KITEAI_RPC_URL || "https://rpc-testnet.gokite.ai/";

const CONTRACTS = {
  AGENT_REGISTRY: "0x59E09856Ca9F15Fd770528e91760B54c982C185e",
  TASK_ESCROW: "0x544f9D8a6564254cE90295fe307088A6F9497bE9",
  MOCK_USDC: "0x25534fF2742d7EfC8cf075500b78324be8637CA5"
};

const AGENT_REGISTRY_ABI = [
  "function totalAgents() view returns (uint256)",
  "function agentAddresses(uint256 index) view returns (address)",
  "function getAgent(address agentAddress) view returns ((address owner, string name, string description, string[] capabilities, uint256 pricePerTask, uint256 reputationScore, bool isActive, uint256 totalTasksCompleted, uint256 registrationTime))",
  "function getAllAgents() view returns ((address owner, string name, string description, string[] capabilities, uint256 pricePerTask, uint256 reputationScore, bool isActive, uint256 totalTasksCompleted, uint256 registrationTime)[])",
  "function getAgentsByCapability(string capability) view returns (address[])"
];

const TASK_ESCROW_ABI = [
  "function getTask(uint256 taskId) view returns ((uint256 taskId, address client, address provider, uint256 amount, string taskData, string taskOutput, uint8 status, uint256 createdAt, uint256 fundedAt, uint256 completedAt, uint256 verifiedAt, uint256 paidAt))",
  "function nextTaskId() view returns (uint256)",
  "function totalTasks() view returns (uint256)"
];

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const agentRegistryContract = new ethers.Contract(
  CONTRACTS.AGENT_REGISTRY,
  AGENT_REGISTRY_ABI,
  provider
);

export const taskEscrowContract = new ethers.Contract(
  CONTRACTS.TASK_ESCROW,
  TASK_ESCROW_ABI,
  provider
);

export interface OnChainAgent {
  ownerAddress: string;
  name: string;
  description: string;
  capabilities: string[];
  pricePerTask: number;
  reputation: number;
  tasksCompleted: number;
  active: boolean;
  registrationTime: number;
}

export interface OnChainTask {
  taskId: number;
  clientAddress: string;
  providerAddress: string;
  amount: number;
  taskData: string;
  taskOutput: string;
  status: string;
  createdAt: number;
  fundedAt: number;
  completedAt: number;
  verifiedAt: number;
  paidAt: number;
}

export function parseAgent(raw: any, walletAddress: string): OnChainAgent {
  return {
    ownerAddress: raw[0],
    name: raw[1],
    description: raw[2],
    capabilities: Array.from(raw[3]),
    pricePerTask: Number(ethers.formatUnits(raw[4], 6)),
    reputation: Number(raw[5]),
    active: raw[6],
    tasksCompleted: Number(raw[7]),
    registrationTime: Number(raw[8])
  };
}

const TASK_STATUS_MAP = ["created", "funded", "in_progress", "completed", "verified", "paid", "refunded", "cancelled"];

export function parseTask(raw: any): OnChainTask {
  const statusIndex = Number(raw[6]);
  return {
    taskId: Number(raw[0]),
    clientAddress: raw[1],
    providerAddress: raw[2],
    amount: Number(ethers.formatUnits(raw[3], 6)),
    taskData: raw[4],
    taskOutput: raw[5],
    status: TASK_STATUS_MAP[statusIndex] || "created",
    createdAt: Number(raw[7]),
    fundedAt: Number(raw[8]),
    completedAt: Number(raw[9]),
    verifiedAt: Number(raw[10]),
    paidAt: Number(raw[11])
  };
}
