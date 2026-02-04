import { Route, Routes, Link } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ProblemsList from './pages/ProblemsList'
import ProblemDetail from './pages/ProblemDetail'
import BattleResults from './pages/BattleResults'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuth } from './contexts/AuthContext'

export default function App() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 inset-x-0 glass z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link to="/" className="text-neon-cyan font-semibold">CodeArena</Link>
          <div className="text-sm opacity-80 flex gap-4">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/problems">Problems</Link>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="opacity-80">{user.username}</span>
                <button onClick={logout} className="px-3 py-1 rounded bg-white/10">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1 rounded bg-white/10">Login</Link>
                <Link to="/signup" className="px-3 py-1 rounded bg-neon-cyan text-black font-semibold">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/problems" element={<ProblemsList />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
          <Route path="/battles/:id/results" element={<BattleResults />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  )
}
