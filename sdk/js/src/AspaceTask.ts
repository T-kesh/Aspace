import { ethers } from "ethers";
import { AspaceWallet } from "./AspaceWallet.js";

const TASK_ESCROW_ABI = [
  "function getTask(uint256 taskId) view returns ((uint256 taskId, address client, address provider, uint256 amount, string taskData, string taskOutput, uint8 status, uint256 createdAt, uint256 fundedAt, uint256 completedAt, uint256 verifiedAt, uint256 paidAt))",
  "function nextTaskId() view returns (uint256)",
  "function createTask(address provider, uint256 amount, string taskData) returns (uint256)",
  "function fundTask(uint256 taskId, uint256 amount)",
  "function startTask(uint256 taskId)",
  "function completeTask(uint256 taskId, string taskOutput)",
  "function releasePayment(uint256 taskId)",
  "function refundTask(uint256 taskId)",
  "function cancelTask(uint256 taskId)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const DEFAULT_ESCROW_ADDRESS = "0x544f9D8a6564254cE90295fe307088A6F9497bE9";
const DEFAULT_USDC_ADDRESS = "0x25534fF2742d7EfC8cf075500b78324be8637CA5";

export enum TaskStatus {
  Created = 0,
  Funded = 1,
  InProgress = 2,
  Completed = 3,
  Verified = 4,
  Paid = 5,
  Refunded = 6,
  Cancelled = 7
}

export interface TaskDetails {
  taskId: number;
  clientAddress: string;
  providerAddress: string;
  amount: number; // formatted as float (USDC 6 decimals)
  taskData: string;
  taskOutput: string;
  status: TaskStatus;
  createdAt: number;
  fundedAt: number;
  completedAt: number;
  verifiedAt: number;
  paidAt: number;
}

export class AspaceTask {
  public contract: ethers.Contract;
  public usdcContract: ethers.Contract;

  constructor(
    private wallet: AspaceWallet,
    contractAddress: string = DEFAULT_ESCROW_ADDRESS,
    usdcAddress: string = DEFAULT_USDC_ADDRESS
  ) {
    this.contract = new ethers.Contract(contractAddress, TASK_ESCROW_ABI, this.wallet.getSigner());
    this.usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, this.wallet.getSigner());
  }

  async approveUsdc(amount: number): Promise<ethers.ContractTransactionResponse> {
    const parsedAmount = ethers.parseUnits(String(amount), 6);
    const contractAddress = await this.contract.getAddress();
    return this.usdcContract.approve(contractAddress, parsedAmount);
  }

  async getUsdcBalance(address: string): Promise<number> {
    const bal = await this.usdcContract.balanceOf(address);
    return Number(ethers.formatUnits(bal, 6));
  }

  async createTask(
    provider: string,
    amount: number,
    taskData: string
  ): Promise<ethers.ContractTransactionResponse> {
    const parsedAmount = ethers.parseUnits(String(amount), 6);
    return this.contract.createTask(provider, parsedAmount, taskData);
  }

  async fundTask(taskId: number, amount: number): Promise<ethers.ContractTransactionResponse> {
    const parsedAmount = ethers.parseUnits(String(amount), 6);
    return this.contract.fundTask(taskId, parsedAmount);
  }

  async startTask(taskId: number): Promise<ethers.ContractTransactionResponse> {
    return this.contract.startTask(taskId);
  }

  async completeTask(taskId: number, taskOutput: string): Promise<ethers.ContractTransactionResponse> {
    return this.contract.completeTask(taskId, taskOutput);
  }

  async releasePayment(taskId: number): Promise<ethers.ContractTransactionResponse> {
    return this.contract.releasePayment(taskId);
  }

  async refundTask(taskId: number): Promise<ethers.ContractTransactionResponse> {
    return this.contract.refundTask(taskId);
  }

  async cancelTask(taskId: number): Promise<ethers.ContractTransactionResponse> {
    return this.contract.cancelTask(taskId);
  }

  async getTask(taskId: number): Promise<TaskDetails> {
    const raw = await this.contract.getTask(taskId);
    return {
      taskId: Number(raw[0]),
      clientAddress: raw[1],
      providerAddress: raw[2],
      amount: Number(ethers.formatUnits(raw[3], 6)),
      taskData: raw[4],
      taskOutput: raw[5],
      status: Number(raw[6]) as TaskStatus,
      createdAt: Number(raw[7]),
      fundedAt: Number(raw[8]),
      completedAt: Number(raw[9]),
      verifiedAt: Number(raw[10]),
      paidAt: Number(raw[11])
    };
  }
}
