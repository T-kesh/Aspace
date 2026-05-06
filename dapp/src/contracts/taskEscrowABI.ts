export const taskEscrowABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_usdcToken", "type": "address"},
      {"internalType": "address", "name": "_initialOwner", "type": "address"},
      {"internalType": "uint256", "name": "_platformFeePercentage", "type": "uint256"},
      {"internalType": "address", "name": "_feeRecipient", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "taskId", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "client", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "provider", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "TaskCreated",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "provider", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "string", "name": "taskData", "type": "string"}
    ],
    "name": "createTask",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "taskId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "fundTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "taskId", "type": "uint256"},
      {"internalType": "string", "name": "taskOutput", "type": "string"}
    ],
    "name": "completeTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "taskId", "type": "uint256"}],
    "name": "getTask",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "taskId", "type": "uint256"},
          {"internalType": "address", "name": "client", "type": "address"},
          {"internalType": "address", "name": "provider", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "string", "name": "taskData", "type": "string"},
          {"internalType": "string", "name": "taskOutput", "type": "string"},
          {"internalType": "uint8", "name": "status", "type": "uint8"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "uint256", "name": "fundedAt", "type": "uint256"},
          {"internalType": "uint256", "name": "completedAt", "type": "uint256"},
          {"internalType": "uint256", "name": "verifiedAt", "type": "uint256"},
          {"internalType": "uint256", "name": "paidAt", "type": "uint256"}
        ],
        "internalType": "struct TaskEscrow.Task",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextTaskId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalTasks", 
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const
