// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface for Reputation contract
interface IReputation {
    function adjustForTaskCompletion(address agent, uint256 taskId, bool success) external;
    function addVerificationBonus(address agent, uint256 taskId) external;
    function addCompletionBonus(address agent, uint256 taskId) external;
}

/**
 * @title TaskEscrow
 * @notice Escrow contract for managing USDC payments for AI agent tasks
 */
contract TaskEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Task status enum
    enum TaskStatus {
        Created,
        Funded,
        InProgress,
        Completed,
        Verified,
        Paid,
        Refunded,
        Cancelled
    }

    // Task structure
    struct Task {
        uint256 taskId;
        address client; // Agent who created the task
        address provider; // Agent who will complete the task
        uint256 amount; // USDC amount (6 decimals)
        string taskData; // Task description/payload
        string taskOutput; // Task result/output
        TaskStatus status;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 completedAt;
        uint256 verifiedAt;
        uint256 paidAt;
    }

    // State variables
    IERC20 public usdcToken;
    mapping(uint256 => Task) public tasks;
    uint256 public totalTasks;
    uint256 public nextTaskId;
    uint256 public platformFeePercentage; // 100 = 1%
    address public feeRecipient;
    address public verifierContract;
    address public reputationContract;

    // Events
    event TaskCreated(uint256 indexed taskId, address indexed client, address provider, uint256 amount);
    event TaskFunded(uint256 indexed taskId, uint256 amount);
    event TaskStarted(uint256 indexed taskId);
    event TaskCompleted(uint256 indexed taskId, string output);
    event TaskVerified(uint256 indexed taskId, bool success);
    event TaskPaid(uint256 indexed taskId, address indexed provider, uint256 amount);
    event TaskRefunded(uint256 indexed taskId, address indexed client, uint256 amount);
    event TaskCancelled(uint256 indexed taskId);
    event PlatformFeeUpdated(uint256 newFeePercentage);
    event FeeRecipientUpdated(address newRecipient);
    event VerifierContractUpdated(address newVerifier);
    event ReputationContractUpdated(address newReputation);

    // Errors
    error TaskNotFound();
    error InvalidAmount();
    error InvalidStatus();
    error NotClient();
    error NotProvider();
    error InsufficientBalance();
    error TaskAlreadyFunded();
    error TaskNotFunded();
    error TaskNotCompleted();
    error TaskAlreadyVerified();
    error TaskAlreadyPaid();
    error TaskCannotBeCancelled();

    constructor(
        address _usdcToken,
        address _initialOwner,
        uint256 _platformFeePercentage,
        address _feeRecipient
    ) Ownable(_initialOwner) {
        usdcToken = IERC20(_usdcToken);
        platformFeePercentage = _platformFeePercentage;
        feeRecipient = _feeRecipient;
        nextTaskId = 1;
    }

    /**
     * @notice Create a new task
     * @param provider The agent that will complete the task
     * @param amount Payment amount in USDC (6 decimals)
     * @param taskData Task description/payload
     */
    function createTask(
        address provider,
        uint256 amount,
        string memory taskData
    ) external returns (uint256) {
        if (amount == 0) revert InvalidAmount();

        uint256 taskId = nextTaskId++;
        tasks[taskId] = Task({
            taskId: taskId,
            client: msg.sender,
            provider: provider,
            amount: amount,
            taskData: taskData,
            taskOutput: "",
            status: TaskStatus.Created,
            createdAt: block.timestamp,
            fundedAt: 0,
            completedAt: 0,
            verifiedAt: 0,
            paidAt: 0
        });

        totalTasks++;

        emit TaskCreated(taskId, msg.sender, provider, amount);
        return taskId;
    }

    /**
     * @notice Fund a task with USDC
     * @param taskId The task ID
     * @param amount Amount to fund (can be partial)
     */
    function fundTask(uint256 taskId, uint256 amount) external nonReentrant {
        Task storage task = tasks[taskId];
        if (task.taskId == 0) revert TaskNotFound();
        if (task.client != msg.sender) revert NotClient();
        if (task.status != TaskStatus.Created && task.status != TaskStatus.Funded) revert InvalidStatus();
        if (amount == 0) revert InvalidAmount();

        // Transfer USDC from client to contract
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        if (task.status == TaskStatus.Created) {
            task.status = TaskStatus.Funded;
            task.fundedAt = block.timestamp;
        }

        emit TaskFunded(taskId, amount);
    }

    /**
     * @notice Start a task (called by provider)
     * @param taskId The task ID
     */
    function startTask(uint256 taskId) external {
        Task storage task = tasks[taskId];
        if (task.taskId == 0) revert TaskNotFound();
        if (task.provider != msg.sender) revert NotProvider();
        if (task.status != TaskStatus.Funded) revert InvalidStatus();

        task.status = TaskStatus.InProgress;

        emit TaskStarted(taskId);
    }

    /**
     * @notice Complete a task with output
     * @param taskId The task ID
     * @param taskOutput The task result/output
     */
    function completeTask(uint256 taskId, string memory taskOutput) external {
        Task storage task = tasks[taskId];
        if (task.taskId == 0) revert TaskNotFound();
        if (task.provider != msg.sender) revert NotProvider();
        if (task.status != TaskStatus.InProgress) revert InvalidStatus();

        task.taskOutput = taskOutput;
        task.status = TaskStatus.Completed;
        task.completedAt = block.timestamp;

        emit TaskCompleted(taskId, taskOutput);
    }

    /**
     * @notice Verify a task result (called by Verifier contract)
     * @param taskId The task ID
     * @param success Whether verification passed
     */
    function verifyTask(uint256 taskId, bool success) external {
        if (msg.sender != verifierContract) revert NotProvider();
        
        Task storage task = tasks[taskId];
        if (task.taskId == 0) revert TaskNotFound();
        if (task.status != TaskStatus.Completed) revert InvalidStatus();
        if (task.verifiedAt != 0) revert TaskAlreadyVerified();

        task.status = success ? TaskStatus.Verified : TaskStatus.Completed;
        task.verifiedAt = block.timestamp;

        // Auto-update reputation when task is verified
        if (reputationContract != address(0)) {
            try IReputation(reputationContract).adjustForTaskCompletion(task.provider, taskId, success) {
                // Reputation update succeeded
            } catch {
                // Reputation update failed, continue without it
            }
        }

        emit TaskVerified(taskId, success);
    }

    /**
     * @notice Release payment to provider after successful verification
     * @param taskId The task ID
     */
    function releasePayment(uint256 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        if (task.taskId == 0) revert TaskNotFound();
        if (task.status != TaskStatus.Verified) revert InvalidStatus();
        if (task.paidAt != 0) revert TaskAlreadyPaid();

        uint256 platformFee = (task.amount * platformFeePercentage) / 10000;
        uint256 providerPayment = task.amount - platformFee;

        // Transfer payment to provider
        usdcToken.safeTransfer(task.provider, providerPayment);

        // Transfer platform fee
        if (platformFee > 0) {
            usdcToken.safeTransfer(feeRecipient, platformFee);
        }

        // Auto-add verification and completion bonuses to reputation
        if (reputationContract != address(0)) {
            try IReputation(reputationContract).addVerificationBonus(task.provider, taskId) {
                // Verification bonus added
            } catch {
                // Verification bonus failed, continue
            }
            
            try IReputation(reputationContract).addCompletionBonus(task.provider, taskId) {
                // Completion bonus added
            } catch {
                // Completion bonus failed, continue
            }
        }

        task.status = TaskStatus.Paid;
        task.paidAt = block.timestamp;

        emit TaskPaid(taskId, task.provider, providerPayment);
    }

    /**
     * @notice Refund task to client (on failure or cancellation)
     * @param taskId The task ID
     */
    function refundTask(uint256 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        if (task.taskId == 0) revert TaskNotFound();
        
        // Only client or owner can request refund
        if (msg.sender != task.client && msg.sender != owner()) {
            revert NotClient();
        }

        if (task.status != TaskStatus.Funded && task.status != TaskStatus.Verified) {
            revert TaskCannotBeCancelled();
        }

        if (task.status == TaskStatus.Paid) revert TaskAlreadyPaid();

        // Refund full amount to client
        usdcToken.safeTransfer(task.client, task.amount);

        task.status = TaskStatus.Refunded;

        emit TaskRefunded(taskId, task.client, task.amount);
    }

    /**
     * @notice Cancel a task (only before funding)
     * @param taskId The task ID
     */
    function cancelTask(uint256 taskId) external {
        Task storage task = tasks[taskId];
        if (task.taskId == 0) revert TaskNotFound();
        if (task.client != msg.sender) revert NotClient();
        if (task.status != TaskStatus.Created) revert TaskCannotBeCancelled();

        task.status = TaskStatus.Cancelled;

        emit TaskCancelled(taskId);
    }

    /**
     * @notice Update platform fee percentage
     * @param newFeePercentage New fee percentage (100 = 1%)
     */
    function setPlatformFee(uint256 newFeePercentage) external onlyOwner {
        if (newFeePercentage > 500) revert InvalidAmount(); // Max 5%
        platformFeePercentage = newFeePercentage;
        emit PlatformFeeUpdated(newFeePercentage);
    }

    /**
     * @notice Update fee recipient
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidAmount();
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    /**
     * @notice Update verifier contract address
     * @param newVerifier New verifier contract address
     */
    function setVerifierContract(address newVerifier) external onlyOwner {
        if (newVerifier == address(0)) revert InvalidAmount();
        verifierContract = newVerifier;
        emit VerifierContractUpdated(newVerifier);
    }

    /**
     * @notice Update reputation contract address
     * @param newReputation New reputation contract address
     */
    function setReputationContract(address newReputation) external onlyOwner {
        if (newReputation == address(0)) revert InvalidAmount();
        reputationContract = newReputation;
        emit ReputationContractUpdated(newReputation);
    }

    /**
     * @notice Get task details
     * @param taskId The task ID
     */
    function getTask(uint256 taskId) external view returns (Task memory) {
        if (tasks[taskId].taskId == 0) revert TaskNotFound();
        return tasks[taskId];
    }

    /**
     * @notice Get tasks by client
     * @param client The client address
     * @param offset Starting index
     * @param limit Number of tasks to return
     */
    function getTasksByClient(address client, uint256 offset, uint256 limit) external view returns (Task[] memory) {
        Task[] memory clientTasks = new Task[](limit);
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalTasks && count < limit; i++) {
            uint256 taskId = i + 1;
            if (tasks[taskId].client == client && i >= offset) {
                clientTasks[count] = tasks[taskId];
                count++;
            }
        }
        
        return clientTasks;
    }

    /**
     * @notice Get tasks by provider
     * @param provider The provider address
     * @param offset Starting index
     * @param limit Number of tasks to return
     */
    function getTasksByProvider(address provider, uint256 offset, uint256 limit) external view returns (Task[] memory) {
        Task[] memory providerTasks = new Task[](limit);
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalTasks && count < limit; i++) {
            uint256 taskId = i + 1;
            if (tasks[taskId].provider == provider && i >= offset) {
                providerTasks[count] = tasks[taskId];
                count++;
            }
        }
        
        return providerTasks;
    }
}
