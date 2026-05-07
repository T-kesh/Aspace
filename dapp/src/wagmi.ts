import { http, createConfig } from 'wagmi'
import { hardhat, sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

// Kite AI testnet configuration
const kiteai = {
  id: 2368,
  name: 'Kite AI Testnet',
  nativeCurrency: { name: 'KITE', symbol: 'KITE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.gokite.ai/'] },
    public: { http: ['https://rpc-testnet.gokite.ai/'] },
  },
  blockExplorers: {
    default: { name: 'Kite AI Explorer', url: 'https://explorer-testnet.gokite.ai' },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [hardhat, kiteai, sepolia],
  connectors: [
    injected(),
    ...(walletConnectProjectId ? [walletConnect({ projectId: walletConnectProjectId })] : []),
  ],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [kiteai.id]: http('https://rpc-testnet.gokite.ai/'),
    [sepolia.id]: http(),
  },
})
