import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiClient } from '@/services/apiClient'
import { motion } from 'framer-motion'
import { Trophy, Swords, ArrowLeft, Clock, Code, Target, TrendingUp, TrendingDown } from 'lucide-react'

interface BattleResult {
  id: number
  winner_id: number | null
  player1: { id: number; username: string; rating: number }
  player2: { id: number; username: string; rating: number }
  problem: { id: number; title: string }
  duration_seconds: number
  player1_score: number
  player2_score: number
}

export default function BattleResults() {
  const { id } = useParams()
  const [battle, setBattle] = useState<BattleResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    apiClient.get(`/api/v1/battles/${id}`)
      .then(r => setBattle(r.data.data))
      .catch(() => setBattle(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="page-shell pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3" />
          <div className="h-64 bg-secondary rounded" />
        </div>
      </div>
    )
  }

  if (!battle) {
    return (
      <div className="page-shell pt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card text-center py-20"
        >
          <Swords className="w-14 h-14 text-muted-foreground/40 mx-auto mb-5" />
          <h2 className="font-display text-2xl font-bold mb-3">Battle not found</h2>
          <Link to="/dashboard" className="text-primary hover:underline font-medium">
            Back to dashboard
          </Link>
        </motion.div>
      </div>
    )
  }

  const isP1Winner = battle.winner_id === battle.player1.id
  const isP2Winner = battle.winner_id === battle.player2.id
  const isDraw = !battle.winner_id

  return (
    <div className="page-shell pt-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-10 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card text-center mb-10 py-12 relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center mx-auto mb-6 shadow-glow-md">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">Battle Results</h1>
          <p className="text-muted-foreground text-lg">
            {battle.problem.title}
          </p>
        </div>
      </motion.div>

      {/* Players comparison */}
      <div className="grid md:grid-cols-3 gap-8 items-center">
        {/* Player 1 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`premium-card text-center ${isP1Winner ? 'border-neon-green/50' : ''}`}
        >
          {isP1Winner && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent" />
          )}
          <div className={`w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl font-bold ${
            isP1Winner 
              ? 'bg-neon-green/15 border-2 border-neon-green text-neon-green' 
              : 'bg-secondary border border-border text-muted-foreground'
          }`}>
            {battle.player1.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">{battle.player1.username}</h3>
          <div className="text-muted-foreground text-sm mb-6">Rating: {battle.player1.rating}</div>
          <div className="text-5xl font-bold text-primary font-display mb-2">{battle.player1_score}</div>
          <div className="text-sm text-muted-foreground">Tests Passed</div>
          {isP1Winner && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-neon-green/15 border border-neon-green/30 rounded-full text-neon-green text-sm font-semibold">
              <Trophy className="w-4 h-4" /> Winner
              <span className="flex items-center gap-1 ml-2 text-xs">
                <TrendingUp className="w-3 h-3" /> +24 ELO
              </span>
            </div>
          )}
          {!isP1Winner && !isDraw && (
            <div className="mt-6 inline-flex items-center gap-1 px-4 py-2 text-muted-foreground text-sm">
              <TrendingDown className="w-3 h-3 text-destructive" /> -12 ELO
            </div>
          )}
        </motion.div>

        {/* VS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto shadow-glow-sm">
            <Swords className="w-10 h-10 text-primary" />
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{Math.floor(battle.duration_seconds / 60)}:{(battle.duration_seconds % 60).toString().padStart(2, '0')}</span>
          </div>
          {isDraw && (
            <div className="mt-4 px-5 py-2.5 bg-neon-yellow/15 border border-neon-yellow/30 rounded-full text-neon-yellow text-sm font-semibold inline-block">
              Draw
            </div>
          )}
        </motion.div>

        {/* Player 2 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`premium-card text-center ${isP2Winner ? 'border-neon-green/50' : ''}`}
        >
          {isP2Winner && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent" />
          )}
          <div className={`w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl font-bold ${
            isP2Winner 
              ? 'bg-neon-green/15 border-2 border-neon-green text-neon-green' 
              : 'bg-secondary border border-border text-muted-foreground'
          }`}>
            {battle.player2.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">{battle.player2.username}</h3>
          <div className="text-muted-foreground text-sm mb-6">Rating: {battle.player2.rating}</div>
          <div className="text-5xl font-bold text-primary font-display mb-2">{battle.player2_score}</div>
          <div className="text-sm text-muted-foreground">Tests Passed</div>
          {isP2Winner && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-neon-green/15 border border-neon-green/30 rounded-full text-neon-green text-sm font-semibold">
              <Trophy className="w-4 h-4" /> Winner
              <span className="flex items-center gap-1 ml-2 text-xs">
                <TrendingUp className="w-3 h-3" /> +24 ELO
              </span>
            </div>
          )}
          {!isP2Winner && !isDraw && (
            <div className="mt-6 inline-flex items-center gap-1 px-4 py-2 text-muted-foreground text-sm">
              <TrendingDown className="w-3 h-3 text-destructive" /> -12 ELO
            </div>
          )}
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-4 mt-12"
      >
        <Link to="/dashboard" className="btn-neon-primary">
          <Swords className="w-4 h-4" />
          Find New Match
        </Link>
        <Link to={`/problems/${battle.problem.id}`} className="btn-neon-ghost">
          <Code className="w-4 h-4" />
          View Problem
        </Link>
        <button className="btn-neon-ghost">
          <Target className="w-4 h-4" />
          Rematch
        </button>
      </motion.div>
    </div>
  )
}
