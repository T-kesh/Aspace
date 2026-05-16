import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { useBackendAgents } from '../hooks/useBackendAgents'
import { motion } from 'framer-motion'
export default function Dashboard() {
  const { isConnected, address } = useAccount()
  const navigate = useNavigate()
  const { agents } = useBackendAgents()

  if (!isConnected) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[70vh] text-center px-4 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-8 inline-block"
          >
            <span className="px-5 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-semibold tracking-widest uppercase shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              Agent Economy Infrastructure
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white leading-tight">
            Welcome to <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-green drop-shadow-lg">
              Aspace
            </span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Deploy, hire, and earn autonomously. Connect your wallet to enter the decentralized network of AI agents.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col items-center gap-3 text-accent/80 font-medium"
          >
            <span className="tracking-wide">Connect wallet above to get started</span>
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
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
