import { AspaceWallet } from "./AspaceWallet.js";
import { AspaceRegistry } from "./AspaceRegistry.js";
import { AspaceTask, TaskStatus, TaskDetails } from "./AspaceTask.js";

export interface AgentConfig {
  wallet: AspaceWallet;
  registryAddress?: string;
  escrowAddress?: string;
  usdcAddress?: string;
}

export class AspaceAgent {
  public wallet: AspaceWallet;
  public registry: AspaceRegistry;
  public tasks: AspaceTask;
  private isRunning: boolean = false;
  private pollIntervalId?: any;

  constructor(config: AgentConfig) {
    this.wallet = config.wallet;
    this.registry = new AspaceRegistry(this.wallet, config.registryAddress);
    this.tasks = new AspaceTask(this.wallet, config.escrowAddress, config.usdcAddress);
  }

  async register(
    name: string,
    description: string,
    capabilities: string[],
    pricePerTask: number
  ): Promise<void> {
    const address = this.wallet.address;
    try {
      console.log(`🤖 Registering agent ${name} (${address}) on-chain...`);
      const tx = await this.registry.registerAgent(address, name, description, capabilities, pricePerTask);
      await tx.wait();
      console.log(`✅ Agent registered on-chain in transaction: ${tx.hash}`);
    } catch (error: any) {
      if (error.message && error.message.includes("AgentAlreadyRegistered")) {
        console.log(`ℹ️ Agent ${address} is already registered on-chain. Updating metadata...`);
        const tx = await this.registry.updateAgent(address, name, description, capabilities, pricePerTask);
        await tx.wait();
        console.log(`✅ Agent updated on-chain.`);
      } else {
        throw error;
      }
    }
  }

  async startListening(
    taskCallback: (taskData: string, task: TaskDetails) => Promise<string>,
    pollIntervalMs: number = 10000
  ): Promise<void> {
    if (this.isRunning) {
      console.warn("⚠️ Agent listener is already running.");
      return;
    }
    this.isRunning = true;
    console.log(`🔄 Autonomous agent listening loop started for address ${this.wallet.address}...`);

    const scanAndProcess = async () => {
      try {
        const nextIdRaw = await this.tasks.contract.nextTaskId();
        const nextId = Number(nextIdRaw);

        // Scan the last 15 tasks to find open funded tasks assigned to us
        const startId = Math.max(1, nextId - 15);
        for (let id = startId; id < nextId; id++) {
          try {
            const task = await this.tasks.getTask(id);
            if (
              task.status === TaskStatus.Funded &&
              task.providerAddress.toLowerCase() === this.wallet.address.toLowerCase()
            ) {
              console.log(`🎉 Found assigned funded task #${task.taskId}. Launching worker...`);
              
              // 1. Accept Task (Switch on-chain status to InProgress)
              console.log(`🤝 Accepting task #${task.taskId}...`);
              const startTx = await this.tasks.startTask(task.taskId);
              await startTx.wait();
              console.log(`✅ Task #${task.taskId} started on-chain.`);

              // 2. Run developer's custom AI logic
              console.log(`🧠 Executing agent logic for task #${task.taskId}...`);
              const output = await taskCallback(task.taskData, task);

              // 3. Complete Task (Submit output on-chain)
              console.log(`📤 Submitting output for task #${task.taskId}...`);
              const completeTx = await this.tasks.completeTask(task.taskId, output);
              await completeTx.wait();
              console.log(`🎯 Task #${task.taskId} successfully completed on-chain!`);
            }
          } catch (taskErr) {
            // Task might not exist or be invalid, skip
          }
        }
      } catch (err: any) {
        console.error("❌ Error in agent scanning loop:", err.message);
      }
    };

    // Run first scan immediately
    await scanAndProcess();

    // Set polling interval
    this.pollIntervalId = setInterval(scanAndProcess, pollIntervalMs);
  }

  stopListening(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = undefined;
    }
    this.isRunning = false;
    console.log("🛑 Autonomous agent listening loop stopped.");
  }
}
