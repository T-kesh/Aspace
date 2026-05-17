import { ethers } from "ethers";
import { AspaceWallet } from "./AspaceWallet.js";

const AGENT_REGISTRY_ABI = [
  "function getAgent(address agentAddress) view returns ((address owner, string name, string description, string[] capabilities, uint256 pricePerTask, uint256 reputationScore, bool isActive, uint256 totalTasksCompleted, uint256 registrationTime))",
  "function registerAgent(address agentAddress, string name, string description, string[] capabilities, uint256 pricePerTask)",
  "function updateAgent(address agentAddress, string name, string description, string[] capabilities, uint256 pricePerTask)",
  "function deactivateAgent(address agentAddress)",
  "function getAllAgents() view returns ((address owner, string name, string description, string[] capabilities, uint256 pricePerTask, uint256 reputationScore, bool isActive, uint256 totalTasksCompleted, uint256 registrationTime)[])",
  "function getAgentsByCapability(string capability) view returns (address[])",
  "event AgentRegistered(address indexed agentAddress, string name, address indexed owner)"
];

const DEFAULT_REGISTRY_ADDRESS = "0x59E09856Ca9F15Fd770528e91760B54c982C185e";

export interface AgentDetails {
  ownerAddress: string;
  name: string;
  description: string;
  capabilities: string[];
  pricePerTask: number; // returned as float formatted number (USDC 6 decimals)
  reputationScore: number;
  isActive: boolean;
  totalTasksCompleted: number;
  registrationTime: number;
}

export class AspaceRegistry {
  public contract: ethers.Contract;

  constructor(
    private wallet: AspaceWallet,
    contractAddress: string = DEFAULT_REGISTRY_ADDRESS
  ) {
    this.contract = new ethers.Contract(contractAddress, AGENT_REGISTRY_ABI, this.wallet.getSigner());
  }

  async registerAgent(
    agentAddress: string,
    name: string,
    description: string,
    capabilities: string[],
    pricePerTask: number
  ): Promise<ethers.ContractTransactionResponse> {
    const parsedPrice = ethers.parseUnits(String(pricePerTask), 6);
    return this.contract.registerAgent(agentAddress, name, description, capabilities, parsedPrice);
  }

  async updateAgent(
    agentAddress: string,
    name: string,
    description: string,
    capabilities: string[],
    pricePerTask: number
  ): Promise<ethers.ContractTransactionResponse> {
    const parsedPrice = ethers.parseUnits(String(pricePerTask), 6);
    return this.contract.updateAgent(agentAddress, name, description, capabilities, parsedPrice);
  }

  async deactivateAgent(agentAddress: string): Promise<ethers.ContractTransactionResponse> {
    return this.contract.deactivateAgent(agentAddress);
  }

  async getAgent(agentAddress: string): Promise<AgentDetails> {
    const raw = await this.contract.getAgent(agentAddress);
    return this.parseAgentStruct(raw);
  }

  async getAllAgents(): Promise<AgentDetails[]> {
    const list = await this.contract.getAllAgents();
    return list.map((a: any) => this.parseAgentStruct(a));
  }

  async getAgentsByCapability(capability: string): Promise<string[]> {
    return this.contract.getAgentsByCapability(capability);
  }

  private parseAgentStruct(raw: any): AgentDetails {
    return {
      ownerAddress: raw[0],
      name: raw[1],
      description: raw[2],
      capabilities: Array.from(raw[3]),
      pricePerTask: Number(ethers.formatUnits(raw[4], 6)),
      reputationScore: Number(raw[5]),
      isActive: raw[6],
      totalTasksCompleted: Number(raw[7]),
      registrationTime: Number(raw[8])
    };
  }
}
