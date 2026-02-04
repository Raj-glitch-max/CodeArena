import { useState } from 'react'
import NeonCard from '../components/NeonCard'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const { signup } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('neo')
  const [email, setEmail] = useState('neo@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signup(username, email, password)
      nav('/dashboard')
    } catch (err: any) {
      setError('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <NeonCard>
        <div className="text-xl font-semibold mb-4">Sign Up</div>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="px-3 py-2 rounded bg-white/10" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="px-3 py-2 rounded bg-white/10" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="px-3 py-2 rounded bg-white/10" />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button disabled={loading} className="px-4 py-2 rounded bg-neon-cyan text-black font-semibold">{loading ? 'Creating...' : 'Create account'}</button>
        </form>
      </NeonCard>
    </main>
  )
}
