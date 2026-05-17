import { ethers } from "ethers";
import { AspaceWallet } from "./AspaceWallet.js";
import { AspaceRegistry, AgentDetails } from "./AspaceRegistry.js";
import { AspaceTask, TaskStatus, TaskDetails } from "./AspaceTask.js";

export interface OrchestratorConfig {
  wallet: AspaceWallet;
  registryAddress?: string;
  escrowAddress?: string;
  usdcAddress?: string;
}

export class AspaceOrchestrator {
  public wallet: AspaceWallet;
  public registry: AspaceRegistry;
  public tasks: AspaceTask;

  constructor(config: OrchestratorConfig) {
    this.wallet = config.wallet;
    this.registry = new AspaceRegistry(this.wallet, config.registryAddress);
    this.tasks = new AspaceTask(this.wallet, config.escrowAddress, config.usdcAddress);
  }

  async findAgentsByCapability(capability: string): Promise<AgentDetails[]> {
    console.log(`🔍 Orchestrator searching registry for capability: "${capability}"...`);
    const addresses = await this.registry.getAgentsByCapability(capability);
    const detailsPromises = addresses.map(addr => this.registry.getAgent(addr));
    const agents = await Promise.all(detailsPromises);
    return agents.filter(agent => agent.isActive);
  }

  async createAndFundTask(
    provider: string,
    amount: number,
    taskData: string
  ): Promise<number> {
    console.log(`🆕 Orchestrator creating task with amount ${amount} USDC for provider: ${provider}...`);
    
    // 1. Create task on-chain
    const createTx = await this.tasks.createTask(provider, amount, taskData);
    const createReceipt = await createTx.wait();
    if (!createReceipt) {
      throw new Error("Failed to get transaction receipt for createTask");
    }

    // Parse taskId from nextTaskId or logs
    let taskId = 0;
    const taskCreatedInterface = new ethers.Interface([
      "event TaskCreated(uint256 indexed taskId, address indexed client, address provider, uint256 amount)"
    ]);

    for (const log of createReceipt.logs) {
      try {
        const parsedLog = taskCreatedInterface.parseLog(log);
        if (parsedLog && parsedLog.name === "TaskCreated") {
          taskId = Number(parsedLog.args.taskId);
          break;
        }
      } catch (e) {
        // Log doesn't match ABI, skip
      }
    }

    if (taskId === 0) {
      // Fallback: fetch nextTaskId and subtract 1
      const nextId = await this.tasks.contract.nextTaskId();
      taskId = Number(nextId) - 1;
    }

    console.log(`✅ Task #${taskId} created. Approving MockUSDC transfer...`);

    // 2. Approve USDC spender allowance
    const approveTx = await this.tasks.approveUsdc(amount);
    await approveTx.wait();
    console.log(`✅ MockUSDC approved. Funding task #${taskId} escrow...`);

    // 3. Fund the task
    const fundTx = await this.tasks.fundTask(taskId, amount);
    await fundTx.wait();
    console.log(`💰 Task #${taskId} successfully funded in escrow!`);

    return taskId;
  }

  async awaitTaskCompletion(
    taskId: number,
    timeoutMs: number = 120000,
    checkIntervalMs: number = 3000
  ): Promise<TaskDetails> {
    console.log(`⏳ Awaiting completion of task #${taskId}...`);
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const task = await this.tasks.getTask(taskId);

          if (
            task.status === TaskStatus.Completed ||
            task.status === TaskStatus.Verified ||
            task.status === TaskStatus.Paid
          ) {
            clearInterval(interval);
            console.log(`🎉 Task #${taskId} complete! Status: ${TaskStatus[task.status]}`);
            resolve(task);
            return;
          }

          if (task.status === TaskStatus.Refunded || task.status === TaskStatus.Cancelled) {
            clearInterval(interval);
            reject(new Error(`Task #${taskId} was aborted with status: ${TaskStatus[task.status]}`));
            return;
          }

          if (Date.now() - startTime > timeoutMs) {
            clearInterval(interval);
            reject(new Error(`Timeout exceeded awaiting completion of task #${taskId}`));
            return;
          }
        } catch (err: any) {
          console.error(`Error polling task #${taskId}:`, err.message);
        }
      }, checkIntervalMs);
    });
  }
}
