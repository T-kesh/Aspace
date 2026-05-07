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
      chain: kiteaiChain,
      account: address,
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

  const agent = useMemo(() => {
    if (!data) return null

    const raw = data as AgentFromContract
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
  }, [data])

  return { agent, isLoading, error }
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
