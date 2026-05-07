const { ethers } = require('ethers');

// Contract configuration
const RPC_URL = 'https://rpc-testnet.gokite.ai/';
const CHAIN_ID = 2368;

// Updated contract addresses from latest deployment
const CONTRACTS = {
  AGENT_REGISTRY: '0x59E09856Ca9F15Fd770528e91760B54c982C185e',
  TASK_ESCROW: '0x544f9D8a6564254cE90295fe307088A6F9497bE9',
  VERIFIER: '0x2E9666Ef15B09Fc43C3Aab3f170E56Ea86E24917',
  REPUTATION: '0x48787C9d837710FBa86C7Ab2E77039dF186F15b6',
  MOCK_USDC: '0x25534fF2742d7EfC8cf075500b78324be8637CA5'
};

// Demo agent configuration
const AGENT_CONFIG = {
  name: 'Demo Agent',
  description: 'Autonomous AI agent for hackathon demo',
  capabilities: ['code-review', 'data-analysis', 'documentation'],
  pricePerTask: ethers.parseUnits('50', 6), // 50 USDC
  privateKey: process.env.AGENT_PRIVATE_KEY || '0x1111111111111111111111111111111111111111111111111111111111111111'
};

// Contract ABIs (simplified for demo)
const AGENT_REGISTRY_ABI = [
  "function getAgent(address agentAddress) view returns ((address owner, string name, string description, string[] capabilities, uint256 pricePerTask, uint256 reputationScore, bool isActive, uint256 totalTasksCompleted, uint256 registrationTime))",
  "function registerAgent(address agentAddress, string name, string description, string[] capabilities, uint256 pricePerTask)",
  "event AgentRegistered(address indexed agentAddress, string name, address indexed owner)"
];

const TASK_ESCROW_ABI = [
  "function getTask(uint256 taskId) view returns ((uint256 taskId, address client, address provider, uint256 amount, string taskData, string taskOutput, uint8 status, uint256 createdAt, uint256 fundedAt, uint256 completedAt, uint256 verifiedAt, uint256 paidAt))",
  "function nextTaskId() view returns (uint256)",
  "function startTask(uint256 taskId)",
  "function completeTask(uint256 taskId, string taskOutput)",
  "event TaskCreated(uint256 indexed taskId, address indexed client, address provider, uint256 amount)",
  "event TaskFunded(uint256 indexed taskId, uint256 amount)",
  "event TaskStarted(uint256 indexed taskId)",
  "event TaskCompleted(uint256 indexed taskId, string output)",
  "event TaskVerified(uint256 indexed taskId, bool success)",
  "event TaskPaid(uint256 indexed taskId, address indexed provider, uint256 amount)"
];

const VERIFIER_ABI = [
  "function verifyByHash(uint256 taskId, string expectedHash, string actualHash, string reason)",
  "function verifyCustom(uint256 taskId, bool success, string reason)",
  "event VerificationAdded(uint256 indexed taskId, bool success, uint256 method)"
];

const USDC_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

class DemoAgent {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.wallet = new ethers.Wallet(AGENT_CONFIG.privateKey, this.provider);
    this.agentAddress = this.wallet.address;
    
    // Initialize contract instances
    this.agentRegistry = new ethers.Contract(CONTRACTS.AGENT_REGISTRY, AGENT_REGISTRY_ABI, this.wallet);
    this.taskEscrow = new ethers.Contract(CONTRACTS.TASK_ESCROW, TASK_ESCROW_ABI, this.wallet);
    this.verifier = new ethers.Contract(CONTRACTS.VERIFIER, VERIFIER_ABI, this.wallet);
    this.usdc = new ethers.Contract(CONTRACTS.MOCK_USDC, USDC_ABI, this.wallet);
    
    console.log(`🤖 Demo Agent initialized: ${this.agentAddress}`);
  }

  async registerAgent() {
    try {
      console.log('📝 Registering agent...');
      
      const tx = await this.agentRegistry.registerAgent(
        this.agentAddress,
        AGENT_CONFIG.name,
        AGENT_CONFIG.description,
        AGENT_CONFIG.capabilities,
        AGENT_CONFIG.pricePerTask
      );
      
      console.log(`📤 Registration transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log('✅ Agent registered successfully!');
      
      // Get agent info to verify
      const agentInfo = await this.agentRegistry.getAgent(this.agentAddress);
      console.log('📋 Agent Info:', {
        name: agentInfo.name,
        capabilities: agentInfo.capabilities,
        pricePerTask: ethers.formatUnits(agentInfo.pricePerTask, 6),
        isActive: agentInfo.isActive
      });
      
    } catch (error) {
      console.error('❌ Failed to register agent:', error.message);
      // Check if already registered
      try {
        const agentInfo = await this.agentRegistry.getAgent(this.agentAddress);
        if (agentInfo.isActive) {
          console.log('✅ Agent already registered');
        }
      } catch (e) {
        console.error('❌ Agent not registered and registration failed');
        throw error;
      }
    }
  }

  async scanForTasks() {
    try {
      console.log('🔍 Scanning for available tasks...');
      
      const nextTaskId = await this.taskEscrow.nextTaskId();
      const availableTasks = [];
      
      // Scan recent tasks (last 10)
      const startId = Math.max(1, Number(nextTaskId) - 10);
      
      for (let i = startId; i < Number(nextTaskId); i++) {
        try {
          const task = await this.taskEscrow.getTask(i);
          
          // Look for funded tasks that match our capabilities
          if (task.status === 1 && task.provider === this.agentAddress) { // Funded status
            availableTasks.push({
              taskId: i,
              client: task.client,
              amount: task.amount,
              taskData: task.taskData,
              status: task.status
            });
          }
        } catch (e) {
          // Task might not exist, skip
        }
      }
      
      console.log(`📋 Found ${availableTasks.length} available tasks`);
      return availableTasks;
      
    } catch (error) {
      console.error('❌ Failed to scan tasks:', error.message);
      return [];
    }
  }

  async acceptTask(task) {
    try {
      console.log(`🤝 Accepting task #${task.taskId}: ${task.taskData}`);
      
      const tx = await this.taskEscrow.startTask(task.taskId);
      console.log(`📤 Start task transaction: ${tx.hash}`);
      await tx.wait();
      console.log('✅ Task accepted and started!');
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to accept task #${task.taskId}:`, error.message);
      return false;
    }
  }

  async completeTask(task) {
    try {
      console.log(`🎯 Completing task #${task.taskId}`);
      
      // Generate mock output based on task type
      let output = '';
      if (task.taskData.toLowerCase().includes('code')) {
        output = 'Code review completed. Found 3 issues and provided recommendations for improvement.';
      } else if (task.taskData.toLowerCase().includes('data')) {
        output = 'Data analysis completed. Generated insights and visualizations for the dataset.';
      } else if (task.taskData.toLowerCase().includes('documentation')) {
        output = 'Documentation completed. Comprehensive API documentation with examples.';
      } else {
        output = 'Task completed successfully. High-quality output delivered.';
      }
      
      const tx = await this.taskEscrow.completeTask(task.taskId, output);
      console.log(`📤 Complete task transaction: ${tx.hash}`);
      await tx.wait();
      console.log('✅ Task completed!');
      
      return output;
    } catch (error) {
      console.error(`❌ Failed to complete task #${task.taskId}:`, error.message);
      return null;
    }
  }

  async verifyTask(taskId, output) {
    try {
      console.log(`🔍 Verifying task #${taskId}`);
      
      // Use custom verification for demo
      const tx = await this.verifier.verifyCustom(
        taskId,
        true, // Always pass for demo
        'Demo verification: Task completed successfully with high quality output'
      );
      
      console.log(`📤 Verification transaction: ${tx.hash}`);
      await tx.wait();
      console.log('✅ Task verified!');
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to verify task #${taskId}:`, error.message);
      return false;
    }
  }

  async checkBalance() {
    try {
      const balance = await this.usdc.balanceOf(this.agentAddress);
      const decimals = await this.usdc.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      console.log(`💰 Current USDC balance: ${formattedBalance} USDC`);
      return formattedBalance;
    } catch (error) {
      console.error('❌ Failed to check balance:', error.message);
      return '0';
    }
  }

  async checkReputation() {
    try {
      const agentInfo = await this.agentRegistry.getAgent(this.agentAddress);
      console.log(`⭐ Reputation Score: ${agentInfo.reputationScore}`);
      console.log(`📊 Tasks Completed: ${agentInfo.totalTasksCompleted}`);
      
      return {
        reputation: agentInfo.reputationScore.toString(),
        tasksCompleted: agentInfo.totalTasksCompleted.toString()
      };
    } catch (error) {
      console.error('❌ Failed to check reputation:', error.message);
      return { reputation: '0', tasksCompleted: '0' };
    }
  }

  async listenForEvents() {
    console.log('👂 Listening for task events...');
    
    // Listen for TaskCreated events
    this.taskEscrow.on('TaskCreated', (taskId, client, provider, amount, event) => {
      if (provider === this.agentAddress) {
        console.log(`🎉 New task created! #${taskId} from ${client}`);
        console.log(`💰 Amount: ${ethers.formatUnits(amount, 6)} USDC`);
      }
    });
    
    // Listen for TaskVerified events
    this.taskEscrow.on('TaskVerified', (taskId, success, event) => {
      console.log(`✅ Task #${taskId} verified: ${success ? 'PASSED' : 'FAILED'}`);
      if (success) {
        console.log('🎉 Ready for payment release!');
      }
    });
    
    // Listen for TaskPaid events
    this.taskEscrow.on('TaskPaid', (taskId, provider, amount, event) => {
      if (provider === this.agentAddress) {
        console.log(`💰 Payment received! Task #${taskId}`);
        console.log(`💵 Amount: ${ethers.formatUnits(amount, 6)} USDC`);
        this.checkBalance(); // Update balance
      }
    });
  }

  async runDemo() {
    console.log('🚀 Starting Demo Agent Workflow...\n');
    
    try {
      // Step 1: Register agent
      await this.registerAgent();
      
      // Step 2: Check initial balance and reputation
      console.log('\n📊 Initial Status:');
      await this.checkBalance();
      await this.checkReputation();
      
      // Step 3: Set up event listeners
      await this.listenForEvents();
      
      // Step 4: Scan for available tasks
      const tasks = await this.scanForTasks();
      
      if (tasks.length > 0) {
        console.log('\n🎯 Processing available tasks...');
        
        for (const task of tasks) {
          console.log(`\n--- Processing Task #${task.taskId} ---`);
          
          // Accept task
          const accepted = await this.acceptTask(task);
          if (!accepted) continue;
          
          // Wait a bit to simulate work
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Complete task
          const output = await this.completeTask(task);
          if (!output) continue;
          
          // Wait a bit for verification
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verify task (in real scenario, this would be done by verifier)
          await this.verifyTask(task.taskId, output);
          
          // Wait for payment
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          console.log(`--- Task #${task.taskId} completed ---\n`);
        }
      } else {
        console.log('ℹ️  No available tasks found. Agent is ready and waiting for tasks.');
      }
      
      // Step 5: Final status
      console.log('\n📊 Final Status:');
      await this.checkBalance();
      await this.checkReputation();
      
      console.log('\n✨ Demo completed! Agent is running and ready for tasks.');
      
      // Keep running to listen for new tasks
      console.log('🔄 Agent continues monitoring for new tasks...');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
      throw error;
    }
  }
}

// Run the demo
if (require.main === module) {
  const agent = new DemoAgent();
  agent.runDemo().catch(console.error);
}

module.exports = DemoAgent;
