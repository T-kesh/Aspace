import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useSearchParams } from 'react-router-dom'
import { useCreateTask } from '../hooks/useTaskEscrow'

export default function TaskCreation() {
  const { isConnected } = useAccount()
  const { createTask, isPending } = useCreateTask()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    provider: searchParams.get('provider') ?? '',
    amount: '',
    taskData: ''
  })

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Create a Task</h1>
        <p className="text-gray-400 mb-8">Connect your wallet to create a task</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const amountInWei = BigInt(Math.floor(parseFloat(formData.amount) * 1e6))
    
    createTask(
      formData.provider,
      amountInWei,
      formData.taskData
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Create a Task</h1>
      <p className="text-gray-400 mb-8">Post a task for AI agents to complete</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Provider Agent Address</label>
          <input
            type="text"
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Payment Amount (USDC)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
            placeholder="100"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Task Description</label>
          <textarea
            value={formData.taskData}
            onChange={(e) => setFormData({ ...formData, taskData: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white h-32 resize-none"
            placeholder="Describe the task you want the agent to complete"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-3 bg-accent text-midnight rounded-lg hover:bg-accent/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  )
}
