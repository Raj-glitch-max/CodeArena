import { useState } from 'react'
import NeonCard from '../components/NeonCard'
import { apiClient } from '../services/apiClient'

export default function Dashboard() {
  const [queueInfo, setQueueInfo] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  async function quickMatch() {
    setLoading(true)
    try {
      const res = await apiClient.post('/api/v1/matchmaking/queue/join', {
        mode: 'ranked_1v1',
        difficulty: 'medium',
        language: 'python',
        algorithm_id: 1
      })
      setQueueInfo(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 grid gap-6">
      <section className="grid md:grid-cols-3 gap-6">
        <NeonCard><div className="text-sm text-gray-400">Rating</div><div className="text-3xl font-bold">1000</div></NeonCard>
        <NeonCard><div className="text-sm text-gray-400">W/L</div><div className="text-3xl font-bold">0/0</div></NeonCard>
        <NeonCard><div className="text-sm text-gray-400">Streak</div><div className="text-3xl font-bold">0</div></NeonCard>
      </section>
      <NeonCard>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Quick Match</div>
            <div className="text-gray-400 text-sm">Join the ranked queue now</div>
          </div>
          <button onClick={quickMatch} disabled={loading} className="px-5 py-3 rounded-lg bg-neon-cyan text-black font-semibold shadow-glow disabled:opacity-60">{loading ? 'Joining...' : 'Join Queue'}</button>
        </div>
        {queueInfo && (
          <div className="mt-4 text-sm text-gray-300">In queue: position {queueInfo.position} of {queueInfo.size}</div>
        )}
      </NeonCard>
    </main>
  )
}
