import { useAccount } from 'wagmi'
import { useAllTasks, useTasks } from '../hooks/useAllTasks'

export default function TaskList() {
  const { isConnected } = useAccount()
  const { nextTaskId } = useAllTasks()

  // Generate task IDs to fetch (fetch first 20 tasks)
  const taskIds = Array.from({ length: Math.min(Number(nextTaskId || 0), 20) }, (_, i) => i + 1)
  const { tasks, isLoading, errors } = useTasks(taskIds)

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">My Tasks</h1>
        <p className="text-gray-400 mb-8">Connect your wallet to view your tasks</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">My Tasks</h1>
        <p className="text-gray-400">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">My Tasks</h1>
      <p className="text-gray-400 mb-8">View your created tasks and their status</p>

      {errors && errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-red-400">Error loading tasks: {errors[0]?.message || 'Unknown error'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.taskId.toString()} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-gray-400">Task #{task.taskId.toString()}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  task.status === 0 ? 'bg-gray-500/20 text-gray-300' :
                  task.status === 1 ? 'bg-blue-500/20 text-blue-300' :
                  task.status === 2 ? 'bg-yellow-500/20 text-yellow-300' :
                  task.status === 3 ? 'bg-green-500/20 text-green-300' :
                  task.status === 4 ? 'bg-purple-500/20 text-purple-300' :
                  task.status === 5 ? 'bg-accent/20 text-accent' :
                  task.status === 6 ? 'bg-orange-500/20 text-orange-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {task.status === 0 ? 'Created' :
                   task.status === 1 ? 'Funded' :
                   task.status === 2 ? 'In Progress' :
                   task.status === 3 ? 'Completed' :
                   task.status === 4 ? 'Verified' :
                   task.status === 5 ? 'Paid' :
                   task.status === 6 ? 'Refunded' :
                   'Cancelled'}
                </span>
              </div>
              <h2 className="text-lg font-semibold mb-2 truncate">{task.taskData}</h2>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="text-accent font-semibold">${Number(task.amount) / 1e6} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="font-mono">{task.provider.slice(0, 6)}...{task.provider.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(Number(task.createdAt) * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            No tasks found. Create a task to get started.
          </div>
        )}
      </div>
    </div>
  )
}
