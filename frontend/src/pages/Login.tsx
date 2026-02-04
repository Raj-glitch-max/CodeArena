import { useState } from 'react'
import NeonCard from '../components/NeonCard'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('dev@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      nav('/dashboard')
    } catch (err: any) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <NeonCard>
        <div className="text-xl font-semibold mb-4">Login</div>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="px-3 py-2 rounded bg-white/10" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="px-3 py-2 rounded bg-white/10" />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button disabled={loading} className="px-4 py-2 rounded bg-neon-cyan text-black font-semibold">{loading ? 'Signing in...' : 'Login'}</button>
        </form>
      </NeonCard>
    </main>
  )
}
