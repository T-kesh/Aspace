import { useReadContract } from 'wagmi'
import { getContractAddresses } from '../contracts/config'
import { useChainId } from 'wagmi'
import { taskEscrowABI } from '../contracts/taskEscrowABI'

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
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId || 2368)

  // Get nextTaskId to know how many tasks to fetch
  const { data: nextTaskId } = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'nextTaskId',
  })

  // Get totalTasks for reference
  const { data: totalTasks } = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'totalTasks',
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
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId || 2368)

  const { data: task, error, isLoading } = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskId)],
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

// Hook to fetch multiple tasks (fixed number of hooks)
export const useTasks = (taskIds: number[]) => {
  const { addresses } = useAllTasks()
  
  // Fixed hooks for first 20 tasks maximum
  const task1 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[0] || 0)],
    query: { enabled: taskIds[0] > 0 }
  })
  const task2 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[1] || 0)],
    query: { enabled: taskIds[1] > 0 }
  })
  const task3 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[2] || 0)],
    query: { enabled: taskIds[2] > 0 }
  })
  const task4 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[3] || 0)],
    query: { enabled: taskIds[3] > 0 }
  })
  const task5 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[4] || 0)],
    query: { enabled: taskIds[4] > 0 }
  })
  const task6 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[5] || 0)],
    query: { enabled: taskIds[5] > 0 }
  })
  const task7 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[6] || 0)],
    query: { enabled: taskIds[6] > 0 }
  })
  const task8 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[7] || 0)],
    query: { enabled: taskIds[7] > 0 }
  })
  const task9 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[8] || 0)],
    query: { enabled: taskIds[8] > 0 }
  })
  const task10 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[9] || 0)],
    query: { enabled: taskIds[9] > 0 }
  })
  const task11 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[10] || 0)],
    query: { enabled: taskIds[10] > 0 }
  })
  const task12 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[11] || 0)],
    query: { enabled: taskIds[11] > 0 }
  })
  const task13 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[12] || 0)],
    query: { enabled: taskIds[12] > 0 }
  })
  const task14 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[13] || 0)],
    query: { enabled: taskIds[13] > 0 }
  })
  const task15 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[14] || 0)],
    query: { enabled: taskIds[14] > 0 }
  })
  const task16 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[15] || 0)],
    query: { enabled: taskIds[15] > 0 }
  })
  const task17 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[16] || 0)],
    query: { enabled: taskIds[16] > 0 }
  })
  const task18 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[17] || 0)],
    query: { enabled: taskIds[17] > 0 }
  })
  const task19 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[18] || 0)],
    query: { enabled: taskIds[18] > 0 }
  })
  const task20 = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [BigInt(taskIds[19] || 0)],
    query: { enabled: taskIds[19] > 0 }
  })

  const allTaskQueries = [
    task1, task2, task3, task4, task5, task6, task7, task8, task9, task10,
    task11, task12, task13, task14, task15, task16, task17, task18, task19, task20
  ]

  const tasks = allTaskQueries.map(query => query.data as unknown as Task | undefined)
  const isLoading = allTaskQueries.some(query => query.isLoading)
  const errors = allTaskQueries.map(query => query.error).filter(Boolean)

  return {
    tasks: tasks.filter(Boolean) as unknown as Task[],
    isLoading,
    errors
  }
}
