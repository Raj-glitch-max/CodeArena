import { Link } from 'react-router-dom'
import NeonCard from '../components/NeonCard'

export default function Landing() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      <section className="text-center py-24">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 neon-text">CodeArena</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">Real-time competitive coding where algorithms fight, evolve, and can permanently die.</p>
        <div className="flex justify-center gap-4">
          <Link to="/dashboard" className="px-6 py-3 rounded-lg bg-neon-cyan text-black font-semibold shadow-glow">Enter Arena</Link>
          <Link to="/problems" className="px-6 py-3 rounded-lg border border-white/20">Browse Problems</Link>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-6">
        <NeonCard><h3 className="text-xl font-semibold mb-2">Real-time Battles</h3><p className="text-gray-300">WebSocket updates, live results, head-to-head.</p></NeonCard>
        <NeonCard><h3 className="text-xl font-semibold mb-2">Evolution & Traits</h3><p className="text-gray-300">Organisms evolve, carry traits, and face permadeath.</p></NeonCard>
        <NeonCard><h3 className="text-xl font-semibold mb-2">Ranked ELO</h3><p className="text-gray-300">Win streaks, leaderboards, and fair matchmaking.</p></NeonCard>
      </section>
    </main>
  )
}
