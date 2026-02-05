import { Route, Routes, Link, NavLink, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Zap, Menu, X, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Landing from '@/pages/Landing'
import Dashboard from '@/pages/Dashboard'
import ProblemsList from '@/pages/ProblemsList'
import ProblemDetail from '@/pages/ProblemDetail'
import BattleResults from '@/pages/BattleResults'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Leaderboard from '@/pages/Leaderboard'
import NotFound from '@/pages/NotFound'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/contexts/AuthContext'
import Algorithms from '@/pages/Algorithms'
import Arena from '@/pages/Arena'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'

export default function App() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/login" replace />
    }
    return <>{children}</>
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {/* Floating particles background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsla(var(--primary), 0.3)`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 8 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Premium glassmorphism navbar */}
        <nav className={`navbar-glass transition-all duration-500 ${isLanding && !scrolled ? 'bg-transparent border-transparent backdrop-blur-none' : ''} ${scrolled ? 'shadow-glow-sm' : ''}`}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center relative">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shadow-glow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-md">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                <span className="gradient-text-static">Code</span>
                <span className="text-foreground">Arena</span>
              </span>
            </Link>

            {/* Desktop Nav - CENTERED */}
            <div className="hidden md:flex gap-2 absolute left-1/2 -translate-x-1/2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `
                 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group
                ${isActive
                    ? 'bg-primary/15 text-primary border border-primary/40 shadow-glow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-transparent'}
              `}
              >
                <span className="relative z-10">Dashboard</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="navHover"
                />
              </NavLink>
              <NavLink
                to="/problems"
                className={({ isActive }) => `
                 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group
                ${isActive
                    ? 'bg-primary/15 text-primary border border-primary/40 shadow-glow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-transparent'}
              `}
              >
                <span className="relative z-10">Problems</span>
              </NavLink>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) => `
                 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group
                 ${isActive
                    ? 'bg-primary/15 text-primary border border-primary/40 shadow-glow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-transparent'}
               `}
              >
                <span className="relative z-10">Leaderboard</span>
              </NavLink>
            </div>

            {/* Auth section */}
            <div className="ml-auto flex items-center gap-4">
              {user ? (
                <>
                  <motion.div
                    className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/60 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/40 to-accent/30 border border-primary/40 flex items-center justify-center shadow-glow-sm">
                      <span className="text-xs font-semibold text-primary">{user.username?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">{user.username}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />Online
                      </span>
                    </div>
                  </motion.div>
                  <button
                    onClick={logout}
                    className="btn-neon-ghost text-sm py-2.5 hover:border-destructive/50 hover:text-destructive transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-neon-ghost text-sm py-2.5 hidden sm:flex">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-neon-primary text-sm py-2.5 group">
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                    Sign Up
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="md:hidden border-t border-border/30 overflow-hidden glass-subtle"
              >
                <div className="px-6 py-5 flex flex-col gap-2">
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-primary/15 text-primary border border-primary/40' : 'text-muted-foreground hover:bg-secondary/60'}`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/problems"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-primary/15 text-primary border border-primary/40' : 'text-muted-foreground hover:bg-secondary/60'}`
                    }
                  >
                    Problems
                  </NavLink>
                  <NavLink
                    to="/leaderboard"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-primary/15 text-primary border border-primary/40' : 'text-muted-foreground hover:bg-secondary/60'}`
                    }
                  >
                    Leaderboard
                  </NavLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Page content with route transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className={isLanding ? '' : 'pt-20'}
          >
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/problems" element={<ProblemsList />} />
              <Route path="/problems/:id" element={<ProblemDetail />} />
              <Route path="/battles/:id/results" element={<ProtectedRoute><BattleResults /></ProtectedRoute>} />
              <Route path="/battles/:id" element={<ProtectedRoute><BattleResults /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/algorithms" element={<ProtectedRoute><Algorithms /></ProtectedRoute>} />
              <Route path="/arena" element={<ProtectedRoute><Arena /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--primary) / 0.3)',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--destructive))',
              border: '1px solid hsl(var(--destructive) / 0.5)',
            },
          },
        }}
      />
    </ErrorBoundary>
  )
}
