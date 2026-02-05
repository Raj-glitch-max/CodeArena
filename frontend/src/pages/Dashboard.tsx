import { useEffect, useState } from 'react'
import { apiClient } from '@/services/apiClient'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Trophy, Flame, Dna, Swords, Home, Clock,
  BarChart3, Settings, Bell, ChevronRight,
  Target, TrendingUp, Users, Zap
} from 'lucide-react'

export default function Dashboard() {
  const [queueInfo, setQueueInfo] = useState<{ position?: number; size?: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [me, setMe] = useState<{ username?: string; rating?: number; battles_won?: number; battles_lost?: number; win_streak?: number } | null>(null)
  const [feed, setFeed] = useState<string[]>([])
  const [algos, setAlgos] = useState<Array<{id: number; name: string; battles_won: number; battles_lost: number}>>([])

  useEffect(() => {
    apiClient.get('/api/v1/users/me').then(r => setMe(r.data.data)).catch(() => {})
    apiClient.get('/api/v1/algorithms').then(r => setAlgos(r.data.data || [])).catch(() => setAlgos([]))
  }, [])

  const winRate = (() => {
    const w = me?.battles_won ?? 0
    const l = me?.battles_lost ?? 0
    const t = w + l
    return t ? `${Math.round((w / t) * 100)}%` : '—'
  })()

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
      setFeed(f => [`Joined queue: position ${res.data.data.position}/${res.data.data.size}`, ...f].slice(0, 10))
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  const sidebarItems = [
    { icon: Home, label: 'Overview', active: true, href: '/dashboard' },
    { icon: Swords, label: 'Arena', badge: '3', href: '/arena' },
    { icon: Dna, label: 'Algorithms', href: '/algorithms' },
    { icon: BarChart3, label: 'Problems', href: '/problems' },
    { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const stats = [
    { icon: Trophy, value: me?.rating ?? '—', label: 'ELO Rating', change: '+24', color: 'cyan' as const },
    { icon: Target, value: winRate, label: 'Win Rate', change: '+2%', color: 'purple' as const },
    { icon: Flame, value: `${me?.win_streak ?? 0}`, label: 'Win Streak', change: 'Best!', color: 'pink' as const },
    { icon: Dna, value: algos.length.toString(), label: 'Algorithms', change: 'Active', color: 'green' as const },
  ]

  const getIconBgClass = (color: string) => {
    const map: Record<string, string> = {
      cyan: 'bg-accent/12 border-accent/30',
      purple: 'bg-primary/12 border-primary/30',
      pink: 'bg-neon-pink/12 border-neon-pink/30',
      green: 'bg-neon-green/12 border-neon-green/30',
    }
    return map[color] || map.purple
  }

  const getIconClass = (color: string) => {
    const map: Record<string, string> = {
      cyan: 'text-accent',
      purple: 'text-primary',
      pink: 'text-neon-pink',
      green: 'text-neon-green',
    }
    return map[color] || map.purple
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 left-0 glass-strong border-r border-border/40 pt-20 z-30">
        <div className="px-5 py-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shadow-glow-sm">
              <Swords className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display font-bold">CodeArena</div>
              <div className="text-xs text-muted-foreground">Dashboard</div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`
                w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-250
                ${item.active 
                  ? 'bg-primary/12 text-primary border border-primary/30 shadow-glow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2.5 py-0.5 text-xs rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        
        {/* User profile */}
        <div className="p-5 border-t border-border/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 border border-border/60 flex items-center justify-center">
                <span className="text-sm font-semibold">{me?.username?.charAt(0).toUpperCase() ?? '?'}</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-neon-green rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{me?.username ?? 'Loading...'}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {me?.rating ?? '—'} ELO
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl lg:text-3xl font-bold"
            >
              Welcome back{me?.username ? `, ${me.username}` : ''} 👋
            </motion.h1>
            <p className="text-muted-foreground mt-1.5">Ready to dominate the arena?</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-3 rounded-xl bg-secondary/50 border border-border/60 hover:bg-secondary/80 transition-all duration-250 hover:-translate-y-0.5">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center bg-accent rounded-full text-accent-foreground font-semibold">
                5
              </span>
            </button>
            <button className="p-3 rounded-xl bg-secondary/50 border border-border/60 hover:bg-secondary/80 transition-all duration-250 hover:-translate-y-0.5">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`stat-card ${stat.color}`}
            >
              <div className={`stat-icon ${getIconBgClass(stat.color)} border`}>
                <stat.icon className={`w-5 h-5 ${getIconClass(stat.color)}`} />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold font-display">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
              <div className="text-xs text-neon-green flex items-center gap-1 bg-neon-green/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Match */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="premium-card overflow-hidden"
            >
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-accent/12 border border-accent/30 flex items-center justify-center">
                      <Swords className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-display text-xl font-bold">Quick Match</h3>
                  </div>
                  <p className="text-muted-foreground ml-13">Jump into a ranked 1v1 battle instantly</p>
                </div>
                <button
                  onClick={quickMatch}
                  disabled={loading}
                  className="btn-neon-accent shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  {loading ? 'Finding...' : 'Find Match'}
                </button>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/40">
                <div className="badge-status live">
                  <span className="text-xs">Live</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {queueInfo ? `${queueInfo.size} players in queue` : '~30 second wait time'}
                </span>
              </div>
            </motion.div>

            {/* Daily Challenge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="premium-card"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-pink/12 border border-neon-pink/30 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-neon-pink" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">Daily Challenge</h3>
                    <p className="text-sm text-muted-foreground">Dynamic Programming: House Robber</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-pink/10 border border-neon-pink/30 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-neon-pink" />
                  <span className="text-sm font-semibold text-neon-pink">7 day streak</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="badge-difficulty hard">Hard</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>~25 min</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>1.2k solved today</span>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-border/40">
                <Link to="/problems/1" className="btn-neon-primary">
                  <Target className="w-4 h-4" />
                  Start Challenge
                </Link>
              </div>
            </motion.div>

            {/* Algorithms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="premium-card"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center">
                    <Dna className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold">Your Algorithms</h3>
                </div>
                <Link to="/algorithms" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {algos.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Dna className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No algorithms yet</p>
                    <p className="text-sm mt-1">Create your first one to start battling</p>
                  </div>
                ) : (
                  algos.slice(0, 3).map((algo) => (
                    <div
                      key={algo.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-surface-2 border border-border/40 hover:border-primary/30 transition-all duration-250 group cursor-pointer hover:-translate-y-0.5"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 border border-primary/30 flex items-center justify-center">
                        <Dna className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium group-hover:text-primary transition-colors">{algo.name}</div>
                        <div className="text-xs text-muted-foreground">{algo.battles_won}W / {algo.battles_lost}L</div>
                      </div>
                      <div className="w-28">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">Win Rate</span>
                          <span className="text-xs font-medium">
                            {algo.battles_won + algo.battles_lost > 0 
                              ? `${Math.round((algo.battles_won / (algo.battles_won + algo.battles_lost)) * 100)}%`
                              : '—'}
                          </span>
                        </div>
                        <div className="progress-bar h-1.5">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min((algo.battles_won / (algo.battles_won + algo.battles_lost)) * 100 || 50, 100)}%` }} 
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Activity feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="premium-card"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/12 border border-accent/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {feed.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No recent activity
                  </div>
                ) : (
                  feed.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="premium-card"
            >
              <h3 className="font-display text-lg font-bold mb-5">Quick Links</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Browse Problems', href: '/problems', icon: BarChart3, color: 'primary' },
                  { label: 'View Leaderboard', href: '/leaderboard', icon: Trophy, color: 'accent' },
                  { label: 'Settings', href: '/settings', icon: Settings, color: 'muted-foreground' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 border border-border/40 hover:border-primary/30 hover:bg-surface-3 transition-all duration-250 text-sm group hover:-translate-y-0.5"
                  >
                    <link.icon className={`w-4 h-4 text-${link.color}`} />
                    <span className="group-hover:text-primary transition-colors">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
