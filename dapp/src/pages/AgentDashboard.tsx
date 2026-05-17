import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { useGetAgent } from '../hooks/useAgentRegistry'
import { useAllTasks, useTasks } from '../hooks/useAllTasks'

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Created',    color: 'bg-gray-500/20 text-gray-300' },
  1: { label: 'Funded',     color: 'bg-blue-500/20 text-blue-300' },
  2: { label: 'In Progress',color: 'bg-yellow-500/20 text-yellow-300' },
  3: { label: 'Completed',  color: 'bg-green-500/20 text-green-300' },
  4: { label: 'Verified',   color: 'bg-purple-500/20 text-purple-300' },
  5: { label: 'Paid',       color: 'bg-accent/20 text-accent' },
  6: { label: 'Refunded',   color: 'bg-orange-500/20 text-orange-300' },
  7: { label: 'Cancelled',  color: 'bg-red-500/20 text-red-300' },
}

export default function AgentDashboard() {
  const { isConnected, address } = useAccount()
  const navigate = useNavigate()
  const { agent, isLoading } = useGetAgent(address || '0x0000000000000000000000000000000000000000')

  // Fetch on-chain tasks to populate "Recent Tasks"
  const { nextTaskId } = useAllTasks()
  const taskIds = Array.from({ length: Math.min(Number(nextTaskId || 0), 20) }, (_, i) => i + 1)
  const { tasks, isLoading: tasksLoading } = useTasks(taskIds)

  // Filter to tasks where connected wallet is client or provider
  const myTasks = address
    ? tasks.filter(
        t =>
          t.client?.toLowerCase() === address.toLowerCase() ||
          t.provider?.toLowerCase() === address.toLowerCase()
      )
    : []

  // Sort by createdAt descending, take last 5
  const recentTasks = [...myTasks]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 5)

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
          <p className="text-3xl font-bold text-green">
            ${agent?.pricePerTask ? Number(agent.pricePerTask) / 1e6 : 0}
          </p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
          <p className={`text-lg font-semibold ${agent?.isActive ? 'text-green' : 'text-red-500'}`}>
            {agent?.isActive ? 'Active' : agent ? 'Inactive' : 'Not Registered'}
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Recent Tasks</h3>
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            View all →
          </button>
        </div>

        {tasksLoading ? (
          <p className="text-gray-400 text-center py-6">Loading tasks from chain...</p>
        ) : recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map((task) => {
              const statusCfg = STATUS_LABELS[task.status] ?? STATUS_LABELS[0]
              const isProvider = task.provider?.toLowerCase() === address?.toLowerCase()
              return (
                <div
                  key={task.taskId.toString()}
                  className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs text-gray-500 shrink-0">#{task.taskId.toString()}</span>
                    <p className="text-sm text-white truncate max-w-xs">{task.taskData}</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400 shrink-0">
                      {isProvider ? 'Provider' : 'Client'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-sm font-semibold text-accent">
                      ${(Number(task.amount) / 1e6).toFixed(2)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-3">No tasks associated with this wallet yet.</p>
            <button
              type="button"
              onClick={() => navigate('/create-task')}
              className="px-4 py-2 bg-accent text-midnight rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Create your first task
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
