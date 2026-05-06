import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { useBackendAgents } from '../hooks/useBackendAgents'
import type { Agent } from '../hooks/useBackendAgents'
import { useLiveAgents } from '../hooks/useLiveAgents'

export default function TaskMarketplace() {
  const { isConnected } = useAccount()
  const navigate = useNavigate()
  const liveAgents = useLiveAgents()
  const backendAgents = useBackendAgents()
  const [capability, setCapability] = useState('')
  const [minReputation, setMinReputation] = useState('20')
  const [hasSearched, setHasSearched] = useState(false)
  const isUsingBackendFallback = Boolean(liveAgents.error)
  const sourceAgents = isUsingBackendFallback ? backendAgents.agents : liveAgents.agents
  const displayedAgents = sourceAgents.filter((agent) => {
    const reputationMatches = agent.reputation >= (Number(minReputation) || 0)
    const capabilityMatches = !hasSearched || !capability.trim() || agent.capabilities.includes(capability.trim())

    return reputationMatches && capabilityMatches
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSearched(true)
  }

  const handleHireAgent = (agent: Agent) => {
    navigate(`/create-task?provider=${agent.walletAddress}`)
  }

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Agent Marketplace</h1>
        <p className="text-gray-400 mb-8">Connect your wallet to browse live on-chain agents</p>
      </div>
    )
  }

  if (liveAgents.isLoading || (isUsingBackendFallback && backendAgents.isLoading)) {
    return <div className="text-center py-20">Loading live agents...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Agent Marketplace</h1>
      <p className="text-gray-400 mb-8">Search live on-chain agents and hire one for a task</p>

      <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
        isUsingBackendFallback ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200' : 'border-green/30 bg-green/10 text-green'
      }`}>
        {isUsingBackendFallback
          ? 'Live registry is unavailable, so this page is showing backend fallback data.'
          : `Live registry connected on chain ${liveAgents.chainId}: ${liveAgents.registryAddress}`}
      </div>

      <form onSubmit={handleSearch} className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
        <input
          type="text"
          value={capability}
          onChange={(e) => setCapability(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
          placeholder="Search capability, e.g. research"
        />
        <input
          type="number"
          value={minReputation}
          onChange={(e) => setMinReputation(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
          placeholder="Min reputation"
          min="0"
          max="100"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Search
        </button>
      </form>

      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          {isUsingBackendFallback ? 'Backend Fallback Agents' : 'Live Registered Agents'}: {displayedAgents.length}
        </p>
        {hasSearched && (
          <button
            type="button"
            onClick={() => {
              setCapability('')
              setHasSearched(false)
            }}
            className="text-sm text-accent hover:text-accent/80"
          >
            Clear search
          </button>
        )}
      </div>

      {isUsingBackendFallback && backendAgents.error && (
        <p className="mb-6 text-sm text-red-400">Backend fallback unavailable: {backendAgents.error.message}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedAgents.map((agent) => (
          <div key={agent.walletAddress} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-accent transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-gray-400">{agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}</span>
              <span className="px-2 py-1 rounded text-xs bg-green/20 text-green">
                Rep {agent.reputation}
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-2">{agent.name}</h2>
            <p className="text-gray-400 text-sm mb-4">{agent.metadataUri || 'No description provided'}</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {agent.capabilities.map((item) => (
                <span key={item} className="px-2 py-1 rounded-full bg-primary/20 text-white text-xs">
                  {item}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-accent font-semibold">${agent.pricePerTask} USDC</span>
              <button
                type="button"
                onClick={() => handleHireAgent(agent)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Hire Agent
              </button>
            </div>
          </div>
        ))}
      </div>

      {!displayedAgents.length && (
        <div className="text-center py-12 text-gray-400">
          {isUsingBackendFallback ? 'No backend fallback agents found.' : 'No live agents registered on this chain yet.'}
        </div>
      )}
    </div>
  )
}
