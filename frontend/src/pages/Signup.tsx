import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock, User, ArrowRight, Zap, Code, Swords, Trophy, Dna } from 'lucide-react'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signup(username, email, password)
      navigate('/dashboard')
    } catch {
      setError('Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Branding */}
      <div className="hidden lg:flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-primary/15" />
        <div className="absolute inset-0 grid-bg" />
        
        {/* Animated orbs */}
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-[100px]"
          style={{ bottom: '10%', left: '10%', background: 'hsla(var(--accent), 0.25)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-60 h-60 rounded-full blur-[80px]"
          style={{ top: '20%', right: '20%', background: 'hsla(var(--primary), 0.2)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 premium-card max-w-md"
        >
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center mb-8 shadow-glow-cyan">
            <Swords className="w-9 h-9 text-accent-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Join the Battle</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Create your account and start your journey to becoming a coding champion.
          </p>
          
          <div className="space-y-5">
            {[
              { icon: Code, title: 'Real-time Battles', desc: 'Compete head-to-head with live updates', color: 'primary' },
              { icon: Trophy, title: 'ELO Rankings', desc: 'Climb the global leaderboard', color: 'accent' },
              { icon: Dna, title: 'Algorithm Evolution', desc: 'Watch your code evolve and adapt', color: 'neon-pink' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-xl bg-${item.color}/12 border border-${item.color}/30 flex items-center justify-center shrink-0 mt-0.5`}>
                  <item.icon className={`w-5 h-5 text-${item.color}`} />
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <span className="section-badge mb-6">
              <Zap className="w-3.5 h-3.5" />
              Get started
            </span>
            <h1 className="font-display text-4xl font-bold mb-3">Create your account</h1>
            <p className="text-muted-foreground text-lg">Enter the arena and start battling today.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="codechampion"
                  className="premium-input pl-11"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Must be at least 8 characters</p>
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

            <button
              type="submit"
              disabled={loading}
              className="btn-neon-primary w-full justify-center"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-foreground">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
