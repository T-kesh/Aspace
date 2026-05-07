export const CONTRACT_ADDRESSES = {
  hardhat: {
    agentRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    taskEscrow: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    verifier: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    reputation: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    usdc: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
  kiteai: {
    agentRegistry: '0x59E09856Ca9F15Fd770528e91760B54c982C185e',
    taskEscrow: '0x544f9D8a6564254cE90295fe307088A6F9497bE9',
    verifier: '0x2E9666Ef15B09Fc43C3Aab3f170E56Ea86E24917',
    reputation: '0x48787C9d837710FBa86C7Ab2E77039dF186F15b6',
    usdc: '0x25534fF2742d7EfC8cf075500b78324be8637CA5',
  },
  sepolia: {
    // TODO: Replace with actual deployed addresses on Sepolia testnet
    agentRegistry: '',
    taskEscrow: '',
    verifier: '',
    reputation: '',
    usdc: '',
  },
} as const

export function getContractAddresses(chainId: number) {
  const isHardhat = chainId === 31337
  const isKiteAi = chainId === 2368
  const isSepolia = chainId === 11155111

  if (isHardhat) {
    return CONTRACT_ADDRESSES.hardhat
  }

  if (isKiteAi) {
    return CONTRACT_ADDRESSES.kiteai
  }

  if (isSepolia) {
    const cfg = CONTRACT_ADDRESSES.sepolia
    if (cfg.agentRegistry && cfg.taskEscrow && cfg.verifier && cfg.reputation && cfg.usdc) {
      return cfg
    }
    console.warn('Sepolia contract addresses are not configured. Falling back to hardhat addresses.')
    return CONTRACT_ADDRESSES.hardhat
  }

  // Default fallback
  return CONTRACT_ADDRESSES.hardhat
}
