export const agentRegistryABI = [
  {
    "inputs": [{"internalType": "address", "name": "initialOwner", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "agentAddress", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "capability", "type": "string"}
    ],
    "name": "CapabilityAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "agentAddress", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "AgentRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "agentAddress", "type": "address"}
    ],
    "name": "AgentDeactivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "agentAddress", "type": "address"}
    ],
    "name": "AgentUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "totalAgents",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "agents",
    "outputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string[]", "name": "capabilities", "type": "string[]"},
      {"internalType": "uint256", "name": "pricePerTask", "type": "uint256"},
      {"internalType": "uint256", "name": "reputationScore", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "totalTasksCompleted", "type": "uint256"},
      {"internalType": "uint256", "name": "registrationTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "agentAddress", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string[]", "name": "capabilities", "type": "string[]"},
      {"internalType": "uint256", "name": "pricePerTask", "type": "uint256"}
    ],
    "name": "registerAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "agentAddress", "type": "address"}],
    "name": "getAgent",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string[]", "name": "capabilities", "type": "string[]"},
          {"internalType": "uint256", "name": "pricePerTask", "type": "uint256"},
          {"internalType": "uint256", "name": "reputationScore", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "totalTasksCompleted", "type": "uint256"},
          {"internalType": "uint256", "name": "registrationTime", "type": "uint256"}
        ],
        "internalType": "struct AgentRegistry.Agent",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllAgents",
<<<<<<< HEAD
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "capability", "type": "string"}],
    "name": "getAgentsByCapability",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "limit", "type": "uint256"}],
    "name": "getTopAgentsByReputation",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
=======
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string[]", "name": "capabilities", "type": "string[]"},
          {"internalType": "uint256", "name": "pricePerTask", "type": "uint256"},
          {"internalType": "uint256", "name": "reputationScore", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "totalTasksCompleted", "type": "uint256"},
          {"internalType": "uint256", "name": "registrationTime", "type": "uint256"}
        ],
        "internalType": "struct AgentRegistry.Agent[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
>>>>>>> 2553469d1a209a2ab9d2fae23b12ca7af565dccb
    "stateMutability": "view",
    "type": "function"
  }
] as const
