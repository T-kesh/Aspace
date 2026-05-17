import { useWriteContract, useReadContract, useAccount } from 'wagmi'
import { agentRegistryABI } from '../contracts/agentRegistryABI'
import { getContractAddresses } from '../contracts/config'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'

const kiteaiChain = {
  id: 2368,
  name: 'Kite AI Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.gokite.ai/'] }
  },
  testnet: true,
}

type AgentFromContract = readonly [
  owner: `0x${string}`,
  name: string,
  description: string,
  capabilities: readonly string[],
  pricePerTask: bigint,
  reputationScore: bigint,
  isActive: boolean,
  totalTasksCompleted: bigint,
  registrationTime: bigint
]

export function useRegisterAgent() {
  const chainId = useChainId()
  const { address } = useAccount()
  const addresses = getContractAddresses(chainId)
  const { writeContract, isPending, error, data: hash } = useWriteContract()

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
      chain: kiteaiChain,
      account: address,
    })
  }

  return { registerAgent, isPending, error, hash }
}

export function useGetAgent(agentAddress: string) {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const { data, isLoading } = useReadContract({
    address: addresses.agentRegistry as `0x${string}`,
    abi: agentRegistryABI,
    functionName: 'getAgent',
    args: [agentAddress as `0x${string}`],
    query: {
      enabled: agentAddress !== '0x0000000000000000000000000000000000000000',
      retry: false,
    }
  })

  const agent = useMemo(() => {
    if (!data) return null

    try {
      const raw = data as unknown as AgentFromContract
      const [
        owner,
        name,
        description,
        capabilities,
        pricePerTask,
        reputationScore,
        isActive,
        totalTasksCompleted,
        registrationTime
      ] = raw

      return {
        ownerAddress: owner,
        name,
        description,
        capabilities: [...capabilities] as string[],
        pricePerTask,
        reputationScore: Number(reputationScore),
        isActive,
        totalTasksCompleted: Number(totalTasksCompleted),
        registrationTime: Number(registrationTime),
      }
    } catch (err) {
      console.error('Error parsing agent data:', err)
      return null
    }
  }, [data])

  // Don't return error - agent not existing is expected
  return { agent, isLoading, error: null }
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
