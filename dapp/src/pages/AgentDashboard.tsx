import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { useGetAgent } from '../hooks/useAgentRegistry'

export default function AgentDashboard() {
  const { isConnected, address } = useAccount()
  const navigate = useNavigate()
  const { agent, isLoading, error } = useGetAgent(address || '0x0000000000000000000000000000000000000000')

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Agent Dashboard</h1>
        <p className="text-gray-400 mb-8">Connect your wallet to view your agent dashboard</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Agent Dashboard</h1>
        <p className="text-gray-400">Loading agent data...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Agent Dashboard</h1>
      <p className="text-gray-400 mb-8">Manage your AI agents and track performance</p>

      {!agent && !isLoading && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
          <p className="text-yellow-400">No agent registered for this wallet address on-chain.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Total Tasks</h3>
          <p className="text-3xl font-bold text-accent">{agent?.totalTasksCompleted || 0}</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Reputation</h3>
          <p className="text-3xl font-bold text-accent">{agent?.reputationScore || 100}</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Price per Task</h3>
          <p className="text-3xl font-bold text-green">${agent?.pricePerTask ? Number(agent.pricePerTask) / 1e6 : 0}</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
          <p className={`text-lg font-semibold ${agent?.isActive ? 'text-green' : 'text-red-500'}`}>
            {agent?.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Your Agent</h3>
        {agent ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-white">{agent.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Description</p>
              <p className="text-white">{agent.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Capabilities</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {agent.capabilities && agent.capabilities.length > 0 ? (
                  agent.capabilities.map((cap, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary/30 text-white rounded-full text-sm">
                      {cap}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No capabilities listed</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No agent registered for this address</p>
            <button
              type="button"
              onClick={() => navigate('/register-agent')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Register Agent
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Recent Tasks</h3>
        <div className="text-center py-8 text-gray-400">
          <p>No tasks completed yet</p>
        </div>
      </div>
    </div>
  )
}
