import { useWriteContract, useReadContract } from 'wagmi'
import { agentRegistryABI } from '../contracts/agentRegistryABI'
import { getContractAddresses } from '../contracts/config'
import { useChainId } from 'wagmi'

export function useRegisterAgent() {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const { writeContract, isPending, error } = useWriteContract()

  const registerAgent = (
    agentAddress: string,
    name: string,
    description: string,
    capabilities: string[],
    pricePerTask: bigint
  ) => {
    writeContract({
      address: addresses.agentRegistry as `0x${string}`,
      abi: agentRegistryABI,
      functionName: 'registerAgent',
      args: [agentAddress as `0x${string}`, name, description, capabilities, pricePerTask],
    })
  }

  return { registerAgent, isPending, error }
}

export function useGetAgent(agentAddress: string) {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const { data, isLoading, error } = useReadContract({
    address: addresses.agentRegistry as `0x${string}`,
    abi: agentRegistryABI,
    functionName: 'getAgent',
    args: [agentAddress as `0x${string}`],
  })

  return { agent: data, isLoading, error }
}

export function useTotalAgents() {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const { data, isLoading, error } = useReadContract({
    address: addresses.agentRegistry as `0x${string}`,
    abi: agentRegistryABI,
    functionName: 'totalAgents',
  })

  return { totalAgents: data, isLoading, error }
}
