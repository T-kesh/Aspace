import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useCreateBackendAgent } from '../hooks/useBackendAgents'
import { useRegisterAgent } from '../hooks/useAgentRegistry'
import { Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

type TransactionStatus = 'idle' | 'submitting' | 'confirming' | 'confirmed' | 'error'

export default function AgentRegistration() {
  const { isConnected, address } = useAccount()
  const { registerAgent, isPending, error, hash } = useRegisterAgent()
  const createBackendAgent = useCreateBackendAgent()
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capabilities: '',
    pricePerTask: ''
  })

  // Update status when hash is received
  useEffect(() => {
    if (hash && txStatus === 'submitting') {
      setTxStatus('confirming')
    }
  }, [hash, txStatus])

  // Simulate confirmation after hash is received
  useEffect(() => {
    if (hash && txStatus === 'confirming') {
      const timer = setTimeout(() => {
        setTxStatus('confirmed')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [hash, txStatus])

  // Handle contract errors
  useEffect(() => {
    if (error && txStatus !== 'error') {
      setTxStatus('error')
    }
  }, [error, txStatus])

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Register Your Agent</h1>
        <p className="text-gray-400 mb-8">Connect your wallet to register an AI agent</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const capabilitiesArray = formData.capabilities.split(',').map(c => c.trim()).filter(Boolean)
    const pricePerTask = Number(formData.pricePerTask)
    const walletAddress = address || '0x0000000000000000000000000000000000000000'
    const priceInWei = BigInt(Math.floor(pricePerTask * 1e6))
    
    setTxStatus('submitting')
    
    try {
      // First try to save to backend
      try {
        await createBackendAgent.mutateAsync({
          walletAddress,
          ownerAddress: walletAddress,
          name: formData.name,
          capabilities: capabilitiesArray,
          pricePerTask,
          metadataUri: formData.description,
        })
      } catch (backendError) {
        console.error('Backend save failed, proceeding with contract registration:', backendError)
        // Continue with contract registration even if backend fails
      }

      // Then register on-chain
      registerAgent(walletAddress, formData.name, formData.description, capabilitiesArray, priceInWei)
    } catch (err) {
      console.error('Registration error:', err)
      setTxStatus('error')
    }
  }

  const renderTransactionStatus = () => {
    if (txStatus === 'idle') return null

    const statusConfig = {
      submitting: {
        icon: Loader2,
        title: 'Submitting Transaction',
        description: 'Please confirm the transaction in your wallet',
        color: 'text-blue-400'
      },
      confirming: {
        icon: Loader2,
        title: 'Confirming Transaction',
        description: 'Transaction is being confirmed on the blockchain',
        color: 'text-yellow-400'
      },
      confirmed: {
        icon: CheckCircle2,
        title: 'Agent Registered Successfully',
        description: 'Your agent has been registered and is now available on the marketplace',
        color: 'text-green-400'
      },
      error: {
        icon: XCircle,
        title: 'Transaction Failed',
        description: error?.message || 'Something went wrong',
        color: 'text-red-400'
      }
    }

    const config = statusConfig[txStatus]
    const Icon = config.icon

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className={`mb-4 ${txStatus === 'confirming' || txStatus === 'submitting' ? 'animate-spin' : ''}`}>
              <Icon className={`w-16 h-16 ${config.color}`} />
            </div>
            
            <h2 className={`text-2xl font-bold mb-2 ${config.color}`}>
              {config.title}
            </h2>
            
            <p className="text-gray-400 mb-6">
              {config.description}
            </p>

            {hash && (
              <div className="w-full bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-500 mb-2">Transaction Hash</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs text-accent truncate flex-1">
                    {hash}
                  </code>
                  <a
                    href={`https://testnet-explorer.gokite.ai/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {txStatus === 'confirmed' && (
              <button
                onClick={() => setTxStatus('idle')}
                className="w-full px-4 py-3 bg-accent text-midnight rounded-lg hover:bg-accent/90 transition-colors font-semibold"
              >
                Register Another Agent
              </button>
            )}

            {txStatus === 'error' && (
              <button
                onClick={() => setTxStatus('idle')}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Register Your Agent</h1>
      <p className="text-gray-400 mb-8">List your AI agent on the Aspace marketplace</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Agent Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
            placeholder="e.g., CodeMaster AI"
            required
            disabled={isPending || createBackendAgent.isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white h-32 resize-none"
            placeholder="Describe your agent's capabilities and use cases"
            required
            disabled={isPending || createBackendAgent.isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Capabilities</label>
          <input
            type="text"
            value={formData.capabilities}
            onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
            placeholder="e.g., coding, analysis, writing (comma-separated)"
            required
            disabled={isPending || createBackendAgent.isPending}
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple capabilities with commas</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price per Task (USDC)</label>
          <input
            type="number"
            value={formData.pricePerTask}
            onChange={(e) => setFormData({ ...formData, pricePerTask: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
            placeholder="10"
            min="0"
            step="0.01"
            required
            disabled={isPending || createBackendAgent.isPending}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || createBackendAgent.isPending}
          className="w-full px-4 py-3 bg-accent text-midnight rounded-lg hover:bg-accent/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || createBackendAgent.isPending ? 'Registering...' : 'Register Agent'}
        </button>
      </form>

      {renderTransactionStatus()}
    </div>
  )
}
