 import { useEffect, useState } from 'react'
 import { motion } from 'framer-motion'
 import { apiClient } from '@/services/apiClient'
 import { 
   Trophy, Medal, Flame, TrendingUp, Crown, 
   Swords, Sparkles, ChevronRight, Users
 } from 'lucide-react'
 import { Link } from 'react-router-dom'
 
 interface LeaderboardEntry {
   rank: number
   user: {
     id: number
     username: string
     avatar_url?: string
     rating: number
   }
   rating: number
   wins: number
   losses: number
   win_rate: number
   streak: number
 }
 
 type TabType = 'global' | 'weekly' | 'algorithms'
 
 export default function Leaderboard() {
   const [entries, setEntries] = useState<LeaderboardEntry[]>([])
   const [loading, setLoading] = useState(true)
   const [activeTab, setActiveTab] = useState<TabType>('global')
 
   useEffect(() => {
     setLoading(true)
     apiClient.get(`/api/v1/leaderboard?type=${activeTab}`)
       .then(r => setEntries(r.data.data || []))
       .catch(() => {
         // Mock data for demo
         setEntries([
           { rank: 1, user: { id: 1, username: 'NeuralNinja', rating: 2150 }, rating: 2150, wins: 156, losses: 23, win_rate: 0.87, streak: 12 },
           { rank: 2, user: { id: 2, username: 'CodeSamurai', rating: 2089 }, rating: 2089, wins: 142, losses: 31, win_rate: 0.82, streak: 8 },
           { rank: 3, user: { id: 3, username: 'BytePhoenix', rating: 2034 }, rating: 2034, wins: 128, losses: 28, win_rate: 0.82, streak: 5 },
           { rank: 4, user: { id: 4, username: 'AlgoQueen', rating: 1987 }, rating: 1987, wins: 115, losses: 35, win_rate: 0.77, streak: 3 },
           { rank: 5, user: { id: 5, username: 'BinaryBoss', rating: 1945 }, rating: 1945, wins: 108, losses: 42, win_rate: 0.72, streak: 6 },
           { rank: 6, user: { id: 6, username: 'StackOverlord', rating: 1912 }, rating: 1912, wins: 98, losses: 38, win_rate: 0.72, streak: 4 },
           { rank: 7, user: { id: 7, username: 'RecursiveKing', rating: 1876 }, rating: 1876, wins: 92, losses: 45, win_rate: 0.67, streak: 2 },
           { rank: 8, user: { id: 8, username: 'HashMaster', rating: 1843 }, rating: 1843, wins: 85, losses: 48, win_rate: 0.64, streak: 1 },
           { rank: 9, user: { id: 9, username: 'TreeTraverser', rating: 1821 }, rating: 1821, wins: 79, losses: 52, win_rate: 0.60, streak: 0 },
           { rank: 10, user: { id: 10, username: 'GraphGuru', rating: 1798 }, rating: 1798, wins: 72, losses: 55, win_rate: 0.57, streak: 0 },
         ])
       })
       .finally(() => setLoading(false))
   }, [activeTab])
 
   const tabs: { id: TabType; label: string; icon: typeof Trophy }[] = [
     { id: 'global', label: 'Global', icon: Trophy },
     { id: 'weekly', label: 'This Week', icon: Flame },
     { id: 'algorithms', label: 'Algorithms', icon: Swords },
   ]
 
   const getRankIcon = (rank: number) => {
     if (rank === 1) return <Crown className="w-5 h-5 text-neon-yellow" />
     if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
     if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
     return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
   }
 
   const getRankBg = (rank: number) => {
     if (rank === 1) return 'bg-gradient-to-r from-neon-yellow/20 to-transparent border-neon-yellow/40'
     if (rank === 2) return 'bg-gradient-to-r from-gray-300/10 to-transparent border-gray-300/30'
     if (rank === 3) return 'bg-gradient-to-r from-amber-600/15 to-transparent border-amber-600/30'
     return 'bg-surface-2 border-border/40'
   }
 
   return (
     <div className="page-shell pt-8">
       {/* Header */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center mb-12"
       >
         <span className="section-badge mb-4 inline-flex">
           <Sparkles className="w-3.5 h-3.5" />
           Rankings
         </span>
         <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3">Leaderboard</h1>
         <p className="text-muted-foreground text-lg">The best algorithm warriors in the arena</p>
       </motion.div>
 
       {/* Tabs */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="flex justify-center gap-2 mb-10"
       >
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`
               flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-250
               ${activeTab === tab.id 
                 ? 'bg-primary/15 text-primary border border-primary/40 shadow-glow-sm' 
                 : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-transparent'}
             `}
           >
             <tab.icon className="w-4 h-4" />
             {tab.label}
           </button>
         ))}
       </motion.div>
 
       {/* Top 3 Podium */}
       {!loading && entries.length >= 3 && (
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="grid md:grid-cols-3 gap-6 mb-12"
         >
           {/* Second Place */}
           <div className="md:order-1 md:mt-8">
             <div className="premium-card text-center border-gray-300/30 relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
               <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-300/20 to-gray-500/10 border-2 border-gray-300/50 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                 {entries[1]?.user.username.charAt(0).toUpperCase()}
               </div>
               <Medal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
               <h3 className="font-display text-xl font-bold">{entries[1]?.user.username}</h3>
               <div className="text-3xl font-bold text-primary font-display mt-2">{entries[1]?.rating}</div>
               <div className="text-sm text-muted-foreground">ELO Rating</div>
               <div className="flex justify-center gap-4 mt-4 text-sm">
                 <span className="text-neon-green">{entries[1]?.wins}W</span>
                 <span className="text-destructive">{entries[1]?.losses}L</span>
               </div>
             </div>
           </div>
 
           {/* First Place */}
           <div className="md:order-2">
             <div className="premium-card text-center border-neon-yellow/50 relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-neon-yellow to-transparent" />
               <div className="absolute inset-0 bg-gradient-to-b from-neon-yellow/10 to-transparent pointer-events-none" />
               <div className="relative">
                 <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-yellow/30 to-amber-500/20 border-2 border-neon-yellow flex items-center justify-center mx-auto mb-4 text-4xl font-bold shadow-glow-md">
                   {entries[0]?.user.username.charAt(0).toUpperCase()}
                 </div>
                 <Crown className="w-10 h-10 text-neon-yellow mx-auto mb-2" />
                 <h3 className="font-display text-2xl font-bold">{entries[0]?.user.username}</h3>
                 <div className="text-4xl font-bold text-primary font-display mt-2">{entries[0]?.rating}</div>
                 <div className="text-sm text-muted-foreground">ELO Rating</div>
                 <div className="flex justify-center gap-4 mt-4 text-sm">
                   <span className="text-neon-green">{entries[0]?.wins}W</span>
                   <span className="text-destructive">{entries[0]?.losses}L</span>
                   <span className="flex items-center gap-1 text-accent">
                     <Flame className="w-3.5 h-3.5" />{entries[0]?.streak}
                   </span>
                 </div>
               </div>
             </div>
           </div>
 
           {/* Third Place */}
           <div className="md:order-3 md:mt-12">
             <div className="premium-card text-center border-amber-600/30 relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
               <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-800/10 border-2 border-amber-600/50 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                 {entries[2]?.user.username.charAt(0).toUpperCase()}
               </div>
               <Medal className="w-8 h-8 text-amber-600 mx-auto mb-2" />
               <h3 className="font-display text-xl font-bold">{entries[2]?.user.username}</h3>
               <div className="text-3xl font-bold text-primary font-display mt-2">{entries[2]?.rating}</div>
               <div className="text-sm text-muted-foreground">ELO Rating</div>
               <div className="flex justify-center gap-4 mt-4 text-sm">
                 <span className="text-neon-green">{entries[2]?.wins}W</span>
                 <span className="text-destructive">{entries[2]?.losses}L</span>
               </div>
             </div>
           </div>
         </motion.div>
       )}
 
       {/* Leaderboard table */}
       {loading ? (
         <div className="space-y-3">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="premium-card animate-pulse">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-secondary rounded-xl" />
                 <div className="w-12 h-12 bg-secondary rounded-xl" />
                 <div className="flex-1">
                   <div className="h-5 bg-secondary rounded w-1/4 mb-2" />
                   <div className="h-4 bg-secondary rounded w-1/6" />
                 </div>
               </div>
             </div>
           ))}
         </div>
       ) : entries.length === 0 ? (
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="premium-card text-center py-20"
         >
           <Users className="w-14 h-14 text-muted-foreground/40 mx-auto mb-5" />
           <h3 className="font-display text-xl font-semibold mb-2">No rankings yet</h3>
           <p className="text-muted-foreground">Be the first to climb the leaderboard!</p>
           <Link to="/dashboard" className="btn-neon-primary mt-6 inline-flex">
             <Swords className="w-4 h-4" />
             Start Battling
           </Link>
         </motion.div>
       ) : (
         <div className="space-y-3">
           {entries.slice(3).map((entry, i) => (
             <motion.div
               key={entry.user.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 + i * 0.05 }}
               className={`premium-card flex items-center gap-5 ${getRankBg(entry.rank)} group hover:border-primary/30`}
             >
               {/* Rank */}
               <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border/60 flex items-center justify-center">
                 {getRankIcon(entry.rank)}
               </div>
 
               {/* Avatar */}
               <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 border border-primary/30 flex items-center justify-center text-xl font-bold">
                 {entry.user.username.charAt(0).toUpperCase()}
               </div>
 
               {/* Info */}
               <div className="flex-1 min-w-0">
                 <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                   {entry.user.username}
                 </h3>
                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                   <span className="text-neon-green">{entry.wins}W</span>
                   <span className="text-destructive">{entry.losses}L</span>
                   <span>{Math.round(entry.win_rate * 100)}% WR</span>
                 </div>
               </div>
 
               {/* Stats */}
               <div className="hidden md:flex items-center gap-6">
                 {entry.streak > 0 && (
                   <div className="flex items-center gap-1.5 text-sm text-accent">
                     <Flame className="w-4 h-4" />
                     <span>{entry.streak} streak</span>
                   </div>
                 )}
                 <div className="flex items-center gap-1.5 text-sm text-neon-green">
                   <TrendingUp className="w-4 h-4" />
                   <span>+24</span>
                 </div>
               </div>
 
               {/* Rating */}
               <div className="text-right">
                 <div className="text-2xl font-bold text-primary font-display">{entry.rating}</div>
                 <div className="text-xs text-muted-foreground">ELO</div>
               </div>
 
               {/* Action */}
               <button className="btn-neon-ghost text-sm py-2.5 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Swords className="w-4 h-4" />
                 Challenge
               </button>
 
               <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
             </motion.div>
           ))}
         </div>
       )}
 
       {/* Load more */}
       {entries.length > 0 && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="text-center mt-10"
         >
           <button className="btn-neon-ghost">
             Load More
             <ChevronRight className="w-4 h-4" />
           </button>
         </motion.div>
       )}
     </div>
   )
 }