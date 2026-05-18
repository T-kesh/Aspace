import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { WalletConnect } from './components/WalletConnect'
import Dashboard from './pages/Dashboard'
import AgentRegistration from './pages/AgentRegistration'
import TaskCreation from './pages/TaskCreation'
import TaskMarketplace from './pages/TaskMarketplace'
import AgentDashboard from './pages/AgentDashboard'
import TaskList from './pages/TaskList'

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-midnight text-white">
        <nav className="border-b border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Aspace
              </Link>
              <div className="flex gap-6">
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link to="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                  Marketplace
                </Link>
                <Link to="/register-agent" className="text-gray-300 hover:text-white transition-colors">
                  Register Agent
                </Link>
                <Link to="/create-task" className="text-gray-300 hover:text-white transition-colors">
                  Create Task
                </Link>
                <Link to="/tasks" className="text-gray-300 hover:text-white transition-colors">
                  My Tasks
                </Link>
                <Link to="/agent-dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Agent Dashboard
                </Link>
              </div>
            </div>
            <WalletConnect />
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register-agent" element={<AgentRegistration />} />
            <Route path="/create-task" element={<TaskCreation />} />
            <Route path="/marketplace" element={<TaskMarketplace />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
            <Route path="/tasks" element={<TaskList />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
