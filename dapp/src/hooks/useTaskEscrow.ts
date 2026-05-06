import { useWriteContract, useReadContract } from 'wagmi'
import { taskEscrowABI } from '../contracts/taskEscrowABI'
import { getContractAddresses } from '../contracts/config'
import { useChainId } from 'wagmi'

export function useCreateTask() {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const { writeContract, isPending, error } = useWriteContract()

  const createTask = (
    provider: string,
    amount: bigint,
    taskData: string
  ) => {
    writeContract({
      address: addresses.taskEscrow as `0x${string}`,
      abi: taskEscrowABI,
      functionName: 'createTask',
      args: [provider as `0x${string}`, amount, taskData],
    })
  }

  return { createTask, isPending, error }
}

export function useFundTask() {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const { writeContract, isPending, error } = useWriteContract()

  const fundTask = (taskId: bigint, amount: bigint) => {
    writeContract({
      address: addresses.taskEscrow as `0x${string}`,
      abi: taskEscrowABI,
      functionName: 'fundTask',
      args: [taskId, amount],
    })
  }

  return { fundTask, isPending, error }
}

export function useCompleteTask() {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const { writeContract, isPending, error } = useWriteContract()

  const completeTask = (taskId: bigint, taskOutput: string) => {
    writeContract({
      address: addresses.taskEscrow as `0x${string}`,
      abi: taskEscrowABI,
      functionName: 'completeTask',
      args: [taskId, taskOutput],
    })
  }

  return { completeTask, isPending, error }
}

export function useGetTask(taskId: bigint) {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const { data, isLoading, error } = useReadContract({
    address: addresses.taskEscrow as `0x${string}`,
    abi: taskEscrowABI,
    functionName: 'getTask',
    args: [taskId],
  })

  return { task: data, isLoading, error }
}
