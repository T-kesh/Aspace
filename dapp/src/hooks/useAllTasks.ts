import { useReadContract } from 'wagmi'
import { getContractAddresses } from '../contracts/config'
import { useAccount } from 'wagmi'
import { taskEscrowAbi } from '../contracts/abis/taskEscrowAbi'

export interface Task {
  taskId: bigint
  client: string
  provider: string
  amount: bigint
  taskData: string
  taskOutput: string
  status: number
  createdAt: bigint
  fundedAt: bigint
  completedAt: bigint
  verifiedAt: bigint
  paidAt: bigint
}

export const useAllTasks = () => {
  const { chainId } = useAccount()
  const addresses = getContractAddresses(chainId || 31337)

  // Get nextTaskId to know how many tasks to fetch
  const { data: nextTaskId } = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowAbi,
    functionName: 'nextTaskId',
    chainId: chainId,
  })

  // Get totalTasks for reference
  const { data: totalTasks } = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowAbi,
    functionName: 'totalTasks',
    chainId: chainId,
  })

  return {
    nextTaskId: nextTaskId as bigint,
    totalTasks: totalTasks as bigint,
    addresses,
    chainId
  }
}

// Hook to fetch individual task
export const useTask = (taskId: number) => {
  const { chainId } = useAccount()
  const addresses = getContractAddresses(chainId || 31337)

  const { data: task, error, isLoading } = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowAbi,
    functionName: 'getTask',
    args: [BigInt(taskId)],
    chainId: chainId,
    query: {
      enabled: taskId > 0,
    }
  })

  return {
    task: task as unknown as Task | undefined,
    error,
    isLoading
  }
}

// Hook to fetch multiple tasks
export const useTasks = (taskIds: number[]) => {
  const { addresses, chainId } = useAllTasks()
  
  const taskQueries = taskIds.map(taskId => 
    useReadContract({
      address: addresses.taskEscrow as `0x${string}`,
      abi: taskEscrowAbi,
      functionName: 'getTask',
      args: [BigInt(taskId)],
      chainId: chainId,
      query: {
        enabled: taskId > 0,
      }
    })
  )

  const tasks = taskQueries.map(query => query.data as unknown as Task | undefined)
  const isLoading = taskQueries.some(query => query.isLoading)
  const errors = taskQueries.map(query => query.error).filter(Boolean)

  return {
    tasks: tasks.filter(Boolean) as unknown as Task[],
    isLoading,
    errors
  }
}
