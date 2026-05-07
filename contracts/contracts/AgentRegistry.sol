// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentRegistry
 * @notice On-chain directory for AI agent metadata and capabilities
 */
contract AgentRegistry is Ownable, ReentrancyGuard {
    // Agent metadata structure
    struct Agent {
        address owner;
        string name;
        string description;
        string[] capabilities;
        uint256 pricePerTask; // in USDC (6 decimals)
        uint256 reputationScore;
        bool isActive;
        uint256 totalTasksCompleted;
        uint256 registrationTime;
    }

    // State variables
    mapping(address => Agent) public agents;
    address[] public agentAddresses;
    mapping(string => address[]) public capabilityToAgents;
    uint256 public totalAgents;

    // Events
    event AgentRegistered(address indexed agentAddress, string name, address indexed owner);
    event AgentUpdated(address indexed agentAddress);
    event AgentDeactivated(address indexed agentAddress);
    event CapabilityAdded(address indexed agentAddress, string capability);

    // Errors
    error AgentAlreadyRegistered();
    error AgentNotRegistered();
    error NotAgentOwner();
    error InvalidCapability();

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Register a new AI agent
     * @param agentAddress The address representing the agent
     * @param name Agent name
     * @param description Agent description
     * @param capabilities Array of capability tags
     * @param pricePerTask Price in USDC (6 decimals)
     */
    function registerAgent(
        address agentAddress,
        string memory name,
        string memory description,
        string[] memory capabilities,
        uint256 pricePerTask
    ) external nonReentrant {
        if (agents[agentAddress].isActive) {
            revert AgentAlreadyRegistered();
        }

        if (capabilities.length == 0) {
            revert InvalidCapability();
        }

        agents[agentAddress] = Agent({
            owner: msg.sender,
            name: name,
            description: description,
            capabilities: capabilities,
            pricePerTask: pricePerTask,
            reputationScore: 100, // Start with base reputation
            isActive: true,
            totalTasksCompleted: 0,
            registrationTime: block.timestamp
        });

        agentAddresses.push(agentAddress);
        totalAgents++;

        // Map capabilities to agent addresses
        for (uint256 i = 0; i < capabilities.length; i++) {
            capabilityToAgents[capabilities[i]].push(agentAddress);
            emit CapabilityAdded(agentAddress, capabilities[i]);
        }

        emit AgentRegistered(agentAddress, name, msg.sender);
    }

    /**
     * @notice Update agent metadata
     * @param agentAddress The agent address
     * @param name New name
     * @param description New description
     * @param capabilities New capabilities array
     * @param pricePerTask New price per task
     */
    function updateAgent(
        address agentAddress,
        string memory name,
        string memory description,
        string[] memory capabilities,
        uint256 pricePerTask
    ) external {
        if (!agents[agentAddress].isActive) {
            revert AgentNotRegistered();
        }
        if (agents[agentAddress].owner != msg.sender) {
            revert NotAgentOwner();
        }

        // Remove old capability mappings
        for (uint256 i = 0; i < agents[agentAddress].capabilities.length; i++) {
            _removeCapabilityMapping(agents[agentAddress].capabilities[i], agentAddress);
        }

        agents[agentAddress].name = name;
        agents[agentAddress].description = description;
        agents[agentAddress].capabilities = capabilities;
        agents[agentAddress].pricePerTask = pricePerTask;

        // Add new capability mappings
        for (uint256 i = 0; i < capabilities.length; i++) {
            capabilityToAgents[capabilities[i]].push(agentAddress);
            emit CapabilityAdded(agentAddress, capabilities[i]);
        }

        emit AgentUpdated(agentAddress);
    }

    /**
     * @notice Deactivate an agent
     * @param agentAddress The agent address
     */
    function deactivateAgent(address agentAddress) external {
        if (!agents[agentAddress].isActive) {
            revert AgentNotRegistered();
        }
        if (agents[agentAddress].owner != msg.sender) {
            revert NotAgentOwner();
        }

        agents[agentAddress].isActive = false;
        emit AgentDeactivated(agentAddress);
    }

    /**
     * @notice Update agent reputation score
     * @param agentAddress The agent address
     * @param newScore New reputation score
     */
    function updateReputation(address agentAddress, uint256 newScore) external onlyOwner {
        if (!agents[agentAddress].isActive) {
            revert AgentNotRegistered();
        }
        agents[agentAddress].reputationScore = newScore;
    }

    /**
     * @notice Increment task completion count for an agent
     * @param agentAddress The agent address
     */
    function incrementTaskCompletion(address agentAddress) external onlyOwner {
        if (!agents[agentAddress].isActive) {
            revert AgentNotRegistered();
        }
        agents[agentAddress].totalTasksCompleted++;
    }

    /**
     * @notice Get agent details
     * @param agentAddress The agent address
     */
    function getAgent(address agentAddress) external view returns (Agent memory) {
        if (!agents[agentAddress].isActive) {
            revert AgentNotRegistered();
        }
        return agents[agentAddress];
    }

    /**
     * @notice Get all registered agents
     */
    function getAllAgents() external view returns (Agent[] memory) {
        Agent[] memory allAgents = new Agent[](totalAgents);
        for (uint256 i = 0; i < totalAgents; i++) {
            allAgents[i] = agents[agentAddresses[i]];
        }
        return allAgents;
    }

    /**
     * @notice Search agents by capability
     * @param capability The capability tag to search for
     */
    function getAgentsByCapability(string memory capability) external view returns (address[] memory) {
        return capabilityToAgents[capability];
    }

    /**
     * @notice Get top agents by reputation score
     * @param limit Number of agents to return
     */
    function getTopAgentsByReputation(uint256 limit) external view returns (address[] memory) {
        address[] memory topAgents = new address[](limit);
        uint256[] memory scores = new uint256[](limit);
        
        // Initialize with agent addresses
        for (uint256 i = 0; i < limit && i < agentAddresses.length; i++) {
            topAgents[i] = agentAddresses[i];
            scores[i] = agents[agentAddresses[i]].reputationScore;
        }

        // Sort by reputation (simple bubble sort for demonstration)
        for (uint256 i = 0; i < limit - 1; i++) {
            for (uint256 j = 0; j < limit - i - 1; j++) {
                if (scores[j] < scores[j + 1]) {
                    // Swap
                    (scores[j], scores[j + 1]) = (scores[j + 1], scores[j]);
                    (topAgents[j], topAgents[j + 1]) = (topAgents[j + 1], topAgents[j]);
                }
            }
        }

        return topAgents;
    }

    // Internal function to remove capability mapping
    function _removeCapabilityMapping(string memory capability, address agentAddress) internal {
        address[] storage agentsWithCap = capabilityToAgents[capability];
        for (uint256 i = 0; i < agentsWithCap.length; i++) {
            if (agentsWithCap[i] == agentAddress) {
                // Move last element to current position and pop
                agentsWithCap[i] = agentsWithCap[agentsWithCap.length - 1];
                agentsWithCap.pop();
                break;
            }
        }
    }
}
