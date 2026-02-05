import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock, ArrowRight, Zap, Trophy, Users, Flame, Swords } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Form */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <span className="section-badge mb-6">
              <Zap className="w-3.5 h-3.5" />
              Welcome back
            </span>
            <h1 className="font-display text-4xl font-bold mb-3">Log in to the Arena</h1>
            <p className="text-muted-foreground text-lg">Pick up where you left off. Your algorithms are waiting.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="premium-input pl-11"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="premium-input pl-11"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3"
              >
                {error}
              </motion.div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border bg-secondary accent-primary" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline font-medium">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon-primary w-full justify-center"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Branding */}
      <div className="hidden lg:flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
        <div className="absolute inset-0 grid-bg" />
        
        {/* Animated orbs */}
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-[100px]"
          style={{ top: '10%', left: '20%', background: 'hsla(var(--primary), 0.25)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-60 h-60 rounded-full blur-[80px]"
          style={{ bottom: '20%', right: '10%', background: 'hsla(var(--accent), 0.2)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 premium-card max-w-md"
        >
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center mb-8 shadow-glow-md">
            <Swords className="w-9 h-9 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Enter the Arena</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of developers battling in real-time to become the ultimate coding champion.
          </p>
          
          <div className="grid grid-cols-3 gap-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/12 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div className="font-display text-lg font-bold">1,847</div>
              <div className="text-xs text-muted-foreground">Avg ELO</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="font-display text-lg font-bold">10K+</div>
              <div className="text-xs text-muted-foreground">Players</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-neon-pink/12 border border-neon-pink/30 flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-neon-pink" />
              </div>
              <div className="font-display text-lg font-bold">50K+</div>
              <div className="text-xs text-muted-foreground">Battles</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
