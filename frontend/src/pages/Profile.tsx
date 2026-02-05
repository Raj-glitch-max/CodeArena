 import { useEffect, useState } from 'react'
 import { motion } from 'framer-motion'
 import { apiClient } from '@/services/apiClient'
 import { useAuth } from '@/contexts/AuthContext'
 import { Link } from 'react-router-dom'
 import {
   Trophy, Flame, Dna, Swords, Calendar,
   Target, Medal, ChevronRight,
   Award, Star, Shield, BarChart3, Edit
 } from 'lucide-react'
 
 interface UserStats {
   rating: number
   rating_history: { date: string; rating: number }[]
   battles_won: number
   battles_lost: number
   win_streak: number
   best_streak: number
   total_problems_solved: number
   rank_global: number
   algorithms_created: number
   algorithms_alive: number
   algorithms_dead: number
   joined_at: string
 }
 
 interface RecentBattle {
   id: number
   opponent: string
   result: 'win' | 'loss' | 'draw'
   elo_change: number
   problem: string
   date: string
 }
 
 interface Achievement {
   id: string
   name: string
   description: string
   icon: string
   unlocked: boolean
   progress?: number
   total?: number
 }
 
 export default function Profile() {
   const { user } = useAuth()
   const [stats, setStats] = useState<UserStats | null>(null)
   const [recentBattles, setRecentBattles] = useState<RecentBattle[]>([])
   const [achievements, setAchievements] = useState<Achievement[]>([])
   const [loading, setLoading] = useState(true)
 
   useEffect(() => {
     Promise.all([
       apiClient.get('/api/v1/users/me/stats').catch(() => null),
       apiClient.get('/api/v1/users/me/battles?limit=5').catch(() => null),
       apiClient.get('/api/v1/users/me/achievements').catch(() => null),
     ])
       .then(() => {
         // Mock data for demo
         setStats({
           rating: user?.rating || 1847,
           rating_history: [
             { date: '2024-01-01', rating: 1500 },
             { date: '2024-01-15', rating: 1650 },
             { date: '2024-02-01', rating: 1720 },
             { date: '2024-02-15', rating: 1800 },
             { date: '2024-03-01', rating: 1847 },
           ],
           battles_won: user?.battles_won || 42,
           battles_lost: user?.battles_lost || 18,
           win_streak: user?.win_streak || 5,
           best_streak: 12,
           total_problems_solved: 87,
           rank_global: 234,
           algorithms_created: 5,
           algorithms_alive: 2,
           algorithms_dead: 3,
           joined_at: user?.created_at || '2024-01-01',
         })
 
         setRecentBattles([
           { id: 1, opponent: 'CodeSamurai', result: 'win', elo_change: 24, problem: 'Two Sum', date: '2h ago' },
           { id: 2, opponent: 'BytePhoenix', result: 'win', elo_change: 18, problem: 'Valid Parentheses', date: '5h ago' },
           { id: 3, opponent: 'AlgoQueen', result: 'loss', elo_change: -12, problem: 'Merge Intervals', date: '1d ago' },
           { id: 4, opponent: 'BinaryBoss', result: 'win', elo_change: 21, problem: 'LRU Cache', date: '2d ago' },
           { id: 5, opponent: 'StackOverlord', result: 'win', elo_change: 15, problem: 'Binary Search', date: '3d ago' },
         ])
 
         setAchievements([
           { id: 'first_blood', name: 'First Blood', description: 'Win your first battle', icon: '⚔️', unlocked: true },
           { id: 'streak_5', name: 'On Fire', description: 'Win 5 battles in a row', icon: '🔥', unlocked: true },
           { id: 'streak_10', name: 'Unstoppable', description: 'Win 10 battles in a row', icon: '💥', unlocked: true },
           { id: 'giant_slayer', name: 'Giant Slayer', description: 'Beat someone 200+ ELO above you', icon: '🗡️', unlocked: true },
           { id: 'centurion', name: 'Centurion', description: 'Win 100 battles', icon: '🏆', unlocked: false, progress: 42, total: 100 },
           { id: 'phoenix', name: 'Phoenix Trainer', description: 'Have an algorithm survive 50 battles', icon: '🐦', unlocked: false, progress: 34, total: 50 },
         ])
       })
       .finally(() => setLoading(false))
   }, [user])
 
   const winRate = stats ? Math.round((stats.battles_won / (stats.battles_won + stats.battles_lost)) * 100) : 0
 
   if (loading) {
     return (
       <div className="page-shell pt-8">
         <div className="animate-pulse space-y-6">
           <div className="h-40 bg-secondary rounded-2xl" />
           <div className="grid md:grid-cols-4 gap-4">
             {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-secondary rounded-xl" />)}
           </div>
         </div>
       </div>
     )
   }
 
   return (
     <div className="page-shell pt-8">
       {/* Profile header */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="premium-card relative overflow-hidden mb-8"
       >
         <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
         
         <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
           <div className="relative">
             <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 border-2 border-primary/50 flex items-center justify-center text-4xl font-bold shadow-glow-md">
               {user?.username?.charAt(0).toUpperCase() || 'U'}
             </div>
             <button className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors">
               <Edit className="w-4 h-4" />
             </button>
           </div>
 
           <div className="flex-1 text-center md:text-left">
             <h1 className="font-display text-3xl font-bold mb-2">{user?.username || 'Warrior'}</h1>
             <p className="text-muted-foreground mb-4">{user?.email}</p>
             <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary">
                 <Trophy className="w-4 h-4" />
                 <span className="font-bold">{stats?.rating}</span> ELO
               </span>
               <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent">
                 <Medal className="w-4 h-4" />
                 Rank #{stats?.rank_global}
               </span>
               <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink">
                 <Flame className="w-4 h-4" />
                 {stats?.win_streak} streak
               </span>
             </div>
           </div>
 
           <Link to="/settings" className="btn-neon-ghost shrink-0">
             <Edit className="w-4 h-4" />
             Edit Profile
           </Link>
         </div>
       </motion.div>
 
       {/* Stats grid */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
       >
         {[
           { icon: Swords, label: 'Battles', value: (stats?.battles_won || 0) + (stats?.battles_lost || 0), color: 'primary' },
           { icon: Target, label: 'Win Rate', value: `${winRate}%`, color: 'accent' },
           { icon: Flame, label: 'Best Streak', value: stats?.best_streak || 0, color: 'neon-pink' },
           { icon: BarChart3, label: 'Problems Solved', value: stats?.total_problems_solved || 0, color: 'neon-green' },
         ].map((stat, i) => (
           <motion.div
             key={stat.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 + i * 0.05 }}
             className="premium-card text-center"
           >
             <stat.icon className={`w-6 h-6 text-${stat.color} mx-auto mb-2`} />
             <div className="text-2xl font-bold font-display">{stat.value}</div>
             <div className="text-sm text-muted-foreground">{stat.label}</div>
           </motion.div>
         ))}
       </motion.div>
 
       <div className="grid lg:grid-cols-3 gap-6">
         {/* Main content */}
         <div className="lg:col-span-2 space-y-6">
           {/* Recent battles */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="premium-card"
           >
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-accent/12 border border-accent/30 flex items-center justify-center">
                   <Swords className="w-5 h-5 text-accent" />
                 </div>
                 <h2 className="font-display text-lg font-bold">Recent Battles</h2>
               </div>
               <Link to="/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1">
                 View all <ChevronRight className="w-4 h-4" />
               </Link>
             </div>
 
             <div className="space-y-3">
               {recentBattles.map((battle, i) => (
                 <motion.div
                   key={battle.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.25 + i * 0.05 }}
                   className="flex items-center gap-4 p-4 rounded-xl bg-surface-2 border border-border/40"
                 >
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                     battle.result === 'win' 
                       ? 'bg-neon-green/15 border border-neon-green/30' 
                       : battle.result === 'loss'
                       ? 'bg-destructive/15 border border-destructive/30'
                       : 'bg-neon-yellow/15 border border-neon-yellow/30'
                   }`}>
                     {battle.result === 'win' ? (
                       <Trophy className="w-5 h-5 text-neon-green" />
                     ) : battle.result === 'loss' ? (
                       <Swords className="w-5 h-5 text-destructive" />
                     ) : (
                       <Shield className="w-5 h-5 text-neon-yellow" />
                     )}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="font-medium">vs {battle.opponent}</div>
                     <div className="text-sm text-muted-foreground">{battle.problem}</div>
                   </div>
                   <div className={`text-sm font-semibold ${
                     battle.elo_change > 0 ? 'text-neon-green' : 'text-destructive'
                   }`}>
                     {battle.elo_change > 0 ? '+' : ''}{battle.elo_change}
                   </div>
                   <div className="text-xs text-muted-foreground">{battle.date}</div>
                 </motion.div>
               ))}
             </div>
           </motion.div>
 
           {/* Algorithms summary */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="premium-card"
           >
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center">
                   <Dna className="w-5 h-5 text-primary" />
                 </div>
                 <h2 className="font-display text-lg font-bold">Algorithm Collection</h2>
               </div>
               <Link to="/algorithms" className="text-sm text-primary hover:underline flex items-center gap-1">
                 Manage <ChevronRight className="w-4 h-4" />
               </Link>
             </div>
 
             <div className="grid grid-cols-3 gap-4 text-center">
               <div className="p-4 rounded-xl bg-surface-2 border border-border/40">
                 <div className="text-2xl font-bold text-primary">{stats?.algorithms_created}</div>
                 <div className="text-sm text-muted-foreground">Created</div>
               </div>
               <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30">
                 <div className="text-2xl font-bold text-neon-green">{stats?.algorithms_alive}</div>
                 <div className="text-sm text-muted-foreground">Alive</div>
               </div>
               <div className="p-4 rounded-xl bg-surface-2 border border-border/40">
                 <div className="text-2xl font-bold text-muted-foreground">{stats?.algorithms_dead}</div>
                 <div className="text-sm text-muted-foreground">Fallen</div>
               </div>
             </div>
           </motion.div>
         </div>
 
         {/* Right column */}
         <div className="space-y-6">
           {/* Achievements */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="premium-card"
           >
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-neon-yellow/12 border border-neon-yellow/30 flex items-center justify-center">
                 <Award className="w-5 h-5 text-neon-yellow" />
               </div>
               <h2 className="font-display text-lg font-bold">Achievements</h2>
             </div>
 
             <div className="space-y-3">
               {achievements.map((achievement, i) => (
                 <motion.div
                   key={achievement.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.45 + i * 0.05 }}
                   className={`p-3 rounded-xl border ${
                     achievement.unlocked 
                       ? 'bg-neon-yellow/5 border-neon-yellow/30' 
                       : 'bg-surface-2 border-border/40 opacity-60'
                   }`}
                 >
                   <div className="flex items-center gap-3">
                     <span className="text-2xl">{achievement.icon}</span>
                     <div className="flex-1">
                       <div className="font-medium text-sm">{achievement.name}</div>
                       <div className="text-xs text-muted-foreground">{achievement.description}</div>
                       {!achievement.unlocked && achievement.progress !== undefined && (
                         <div className="mt-2">
                           <div className="progress-bar h-1.5">
                             <div 
                               className="progress-fill" 
                               style={{ width: `${(achievement.progress / (achievement.total || 1)) * 100}%` }} 
                             />
                           </div>
                           <div className="text-xs text-muted-foreground mt-1">
                             {achievement.progress}/{achievement.total}
                           </div>
                         </div>
                       )}
                     </div>
                     {achievement.unlocked && (
                       <Star className="w-4 h-4 text-neon-yellow" />
                     )}
                   </div>
                 </motion.div>
               ))}
             </div>
           </motion.div>
 
           {/* Member since */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="premium-card text-center"
           >
             <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
             <div className="text-sm text-muted-foreground">Member since</div>
             <div className="font-display font-bold">
               {new Date(stats?.joined_at || '').toLocaleDateString('en-US', { 
                 month: 'long', 
                 year: 'numeric' 
               })}
             </div>
           </motion.div>
         </div>
       </div>
     </div>
   )
 }