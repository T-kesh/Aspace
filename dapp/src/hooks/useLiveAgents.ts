import { useMemo } from 'react'
import { useChainId, useReadContract, useReadContracts } from 'wagmi'
import { agentRegistryABI } from '../contracts/agentRegistryABI'
import { getContractAddresses } from '../contracts/config'
import type { Agent } from './useBackendAgents'

type ContractAgent = readonly [
  owner: `0x${string}`,
  name: string,
  description: string,
  capabilities: readonly string[],
  pricePerTask: bigint,
  reputationScore: bigint,
  isActive: boolean,
  totalTasksCompleted: bigint,
  registrationTime: bigint,
]

export function useLiveAgents() {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)
  const registryAddress = addresses.agentRegistry as `0x${string}`

  const agentAddressesQuery = useReadContract({
    address: registryAddress,
    abi: agentRegistryABI,
    functionName: 'getAllAgents',
  })

  const agentAddresses = (agentAddressesQuery.data ?? []) as `0x${string}`[]

  const agentDetailsQuery = useReadContracts({
    contracts: agentAddresses.map((agentAddress) => ({
      address: registryAddress,
      abi: agentRegistryABI,
      functionName: 'getAgent',
      args: [agentAddress],
    })),
    query: {
      enabled: agentAddresses.length > 0,
    },
  })

  const agents = useMemo<Agent[]>(() => {
    return (agentDetailsQuery.data ?? [])
      .flatMap((result, index): Agent[] => {
        if (result.status !== 'success') {
          return []
        }

        const agent = result.result as ContractAgent

        if (!agent[6]) {
          return []
        }

        return [{
          walletAddress: agentAddresses[index],
          ownerAddress: agent[0],
          name: agent[1],
          metadataUri: agent[2],
          capabilities: [...agent[3]],
          pricePerTask: Number(agent[4]) / 1e6,
          reputation: Number(agent[5]),
          tasksCompleted: Number(agent[7]),
          active: agent[6],
          createdAt: new Date(Number(agent[8]) * 1000).toISOString(),
        }]
      })
  }, [agentAddresses, agentDetailsQuery.data])

  return {
    agents,
    isLoading: agentAddressesQuery.isLoading || agentDetailsQuery.isLoading,
    error: agentAddressesQuery.error ?? agentDetailsQuery.error,
    chainId,
    registryAddress,
  }
}
