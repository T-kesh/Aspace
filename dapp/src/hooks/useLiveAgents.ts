import { useMemo } from 'react'
import { useChainId, useReadContract, useReadContracts } from 'wagmi'
import { agentRegistryABI } from '../contracts/agentRegistryABI'
import { getContractAddresses } from '../contracts/config'
import type { Agent } from './useBackendAgents'

// The shape wagmi decodes from the getAgent tuple ABI
type ContractAgent = {
  owner: `0x${string}`
  name: string
  description: string
  capabilities: readonly string[]
  pricePerTask: bigint
  reputationScore: bigint
  isActive: boolean
  totalTasksCompleted: bigint
  registrationTime: bigint
}

export function useLiveAgents() {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)
  const registryAddress = addresses.agentRegistry as `0x${string}`

  // Step 1: get totalAgents count to know how many addresses to fetch
  const { data: totalAgentsData } = useReadContract({
    address: registryAddress,
    abi: agentRegistryABI,
    functionName: 'totalAgents',
  })

  const totalAgents = Number(totalAgentsData ?? 0)

  // Step 2: batch-fetch each agent address from the agentAddresses[] public array
  const agentAddressQueries = useReadContracts({
    contracts: Array.from({ length: totalAgents }, (_, i) => ({
      address: registryAddress,
      abi: agentRegistryABI,
      functionName: 'agentAddresses',
      args: [BigInt(i)],
    })),
    query: { enabled: totalAgents > 0 },
  })

  const agentAddresses = useMemo(() => {
    if (!agentAddressQueries.data) return []
    return agentAddressQueries.data
      .map((r) => r?.result as `0x${string}` | undefined)
      .filter((addr): addr is `0x${string}` => !!addr)
  }, [agentAddressQueries.data])

  // Step 3: batch-fetch full agent structs via getAgent
  const agentDetailQueries = useReadContracts({
    contracts: agentAddresses.map((agentAddress) => ({
      address: registryAddress,
      abi: agentRegistryABI,
      functionName: 'getAgent',
      args: [agentAddress],
    })),
    query: { enabled: agentAddresses.length > 0 },
  })

  const agents = useMemo<Agent[]>(() => {
    if (!agentDetailQueries.data) return []

    return agentDetailQueries.data.flatMap((result, index): Agent[] => {
      if (!result || result.status !== 'success' || !result.result) return []

      const agent = result.result as unknown as ContractAgent
      if (!agent.isActive) return []

      return [{
        walletAddress: agentAddresses[index],
        ownerAddress: agent.owner,
        name: agent.name,
        metadataUri: agent.description,
        capabilities: [...agent.capabilities],
        pricePerTask: Number(agent.pricePerTask) / 1e6,
        reputation: Number(agent.reputationScore),
        tasksCompleted: Number(agent.totalTasksCompleted),
        active: agent.isActive,
        createdAt: new Date(Number(agent.registrationTime) * 1000).toISOString(),
      }]
    })
  }, [agentDetailQueries.data, agentAddresses])

  return {
    agents,
    isLoading: agentAddressQueries.isLoading || agentDetailQueries.isLoading,
    error: agentAddressQueries.error ?? agentDetailQueries.error,
    chainId,
    registryAddress,
  }
}
