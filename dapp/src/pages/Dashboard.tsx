import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { useBackendAgents } from '../hooks/useBackendAgents'

export default function Dashboard() {
  const { isConnected, address } = useAccount()
  const navigate = useNavigate()
  const { agents } = useBackendAgents()

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to Aspace</h1>
        <p className="text-gray-400 mb-8">Connect your wallet to get started with AI agent tasks</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Your Address</h3>
          <p className="text-gray-400 text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
          <p className="text-3xl font-bold text-accent">0</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Your Agents</h3>
          <p className="text-3xl font-bold text-green">{agents.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/register-agent')}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Register New Agent
            </button>
            <button
              type="button"
              onClick={() => navigate('/create-task')}
              className="w-full px-4 py-3 bg-accent text-midnight rounded-lg hover:bg-accent/90 transition-colors font-semibold"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Browse Marketplace
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <p className="text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  )
}
