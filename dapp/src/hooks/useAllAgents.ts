import { useReadContract } from 'wagmi'
import { agentRegistryABI } from '../contracts/agentRegistryABI'
import { getContractAddresses } from '../contracts/config'
import { useChainId } from 'wagmi'

export interface Agent {
  owner: string
  name: string
  description: string
  capabilities: string[]
  pricePerTask: bigint
  reputationScore: bigint
  isActive: boolean
  totalTasksCompleted: bigint
  registrationTime: bigint
}

export function useAllAgents() {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const { data, isLoading, error } = useReadContract({
    address: addresses.agentRegistry as `0x${string}`,
    abi: agentRegistryABI,
    functionName: 'getAllAgents',
  })

  return { agents: data as Agent[] | undefined, isLoading, error }
}
