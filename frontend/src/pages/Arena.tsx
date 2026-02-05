 import { useEffect, useState, useCallback } from 'react'
 import { motion, AnimatePresence } from 'framer-motion'
 import { apiClient } from '@/services/apiClient'
 import { Link, useNavigate } from 'react-router-dom'
 import {
   Swords, Users, Trophy, Dna, Zap,
   X, Target, Flame,
   Shield, AlertTriangle, CheckCircle
 } from 'lucide-react'
 
 interface Algorithm {
   id: number
   name: string
   language: string
   rating: number
   is_alive: boolean
   death_count: number
 }
 
 interface QueueStatus {
   position: number
   size: number
   estimated_wait: number
   status: 'searching' | 'found' | 'starting'
   opponent?: {
     username: string
     rating: number
     algorithm: string
   }
 }
 
 type MatchMode = 'ranked_1v1' | 'casual' | 'practice'
 type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
 
 export default function Arena() {
   const navigate = useNavigate()
   const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
   const [selectedAlgo, setSelectedAlgo] = useState<Algorithm | null>(null)
   const [mode, setMode] = useState<MatchMode>('ranked_1v1')
   const [difficulty, setDifficulty] = useState<Difficulty>('medium')
   const [loading, setLoading] = useState(true)
   const [inQueue, setInQueue] = useState(false)
   const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
   const [searchTime, setSearchTime] = useState(0)
 
   useEffect(() => {
     apiClient.get('/api/v1/algorithms')
       .then(r => {
         const alive = (r.data.data || []).filter((a: Algorithm) => a.is_alive)
         setAlgorithms(alive)
         if (alive.length > 0 && alive[0]) setSelectedAlgo(alive[0])
       })
       .catch(() => {
         const mock: Algorithm[] = [
           { id: 1, name: 'Phoenix Rising', language: 'python', rating: 1847, is_alive: true, death_count: 1 },
           { id: 2, name: 'Shadow Recursion', language: 'python', rating: 1623, is_alive: true, death_count: 2 },
         ]
         setAlgorithms(mock)
         if (mock[0]) setSelectedAlgo(mock[0])
       })
       .finally(() => setLoading(false))
   }, [])
 
   useEffect(() => {
     let interval: ReturnType<typeof setInterval>
     if (inQueue) {
       interval = setInterval(() => setSearchTime(t => t + 1), 1000)
     } else {
       setSearchTime(0)
     }
     return () => clearInterval(interval)
   }, [inQueue])
 
   const joinQueue = useCallback(async () => {
     if (!selectedAlgo) return
     setInQueue(true)
     setQueueStatus({ position: 1, size: 12, estimated_wait: 30, status: 'searching' })
 
     try {
       await apiClient.post('/api/v1/matchmaking/queue/join', {
         mode,
         difficulty,
         language: selectedAlgo.language,
         algorithm_id: selectedAlgo.id,
       })
       // Simulate finding opponent after delay
       setTimeout(() => {
         setQueueStatus({
           position: 1,
           size: 12,
           estimated_wait: 0,
           status: 'found',
           opponent: {
             username: 'CodeSamurai',
             rating: 1923,
             algorithm: 'Binary Beast',
           },
         })
         setTimeout(() => {
           setQueueStatus(prev => prev ? { ...prev, status: 'starting' } : null)
           setTimeout(() => navigate('/problems/1'), 1500)
         }, 2000)
       }, 3000)
     } catch {
       // Demo: simulate queue anyway
       setTimeout(() => {
         setQueueStatus({
           position: 1,
           size: 12,
           estimated_wait: 0,
           status: 'found',
           opponent: { username: 'DemoPlayer', rating: 1800, algorithm: 'Test Bot' },
         })
         setTimeout(() => {
           setQueueStatus(prev => prev ? { ...prev, status: 'starting' } : null)
           setTimeout(() => navigate('/problems/1'), 1500)
         }, 2000)
       }, 3000)
     }
   }, [selectedAlgo, mode, difficulty, navigate])
 
   const leaveQueue = () => {
     setInQueue(false)
     setQueueStatus(null)
     apiClient.post('/api/v1/matchmaking/queue/leave').catch(() => {})
   }
 
   const formatTime = (seconds: number) => {
     const m = Math.floor(seconds / 60)
     const s = seconds % 60
     return `${m}:${s.toString().padStart(2, '0')}`
   }
 
   const modes: { id: MatchMode; label: string; desc: string; icon: typeof Swords }[] = [
     { id: 'ranked_1v1', label: 'Ranked 1v1', desc: 'ELO at stake, permadeath enabled', icon: Swords },
     { id: 'casual', label: 'Casual', desc: 'No ELO loss, practice safely', icon: Shield },
     { id: 'practice', label: 'Practice', desc: 'Solo against AI bot', icon: Target },
   ]
 
   const difficulties: { id: Difficulty; label: string; color: string }[] = [
     { id: 'easy', label: 'Easy', color: 'neon-green' },
     { id: 'medium', label: 'Medium', color: 'neon-yellow' },
     { id: 'hard', label: 'Hard', color: 'accent' },
     { id: 'expert', label: 'Expert', color: 'destructive' },
   ]
 
   return (
     <div className="page-shell pt-8 max-w-4xl">
       {/* Header */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center mb-12"
       >
         <span className="section-badge mb-4 inline-flex">
           <Zap className="w-3.5 h-3.5" />
           Battle Arena
         </span>
         <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3">Enter the Arena</h1>
         <p className="text-muted-foreground text-lg">Choose your warrior and find an opponent</p>
       </motion.div>
 
       {/* Queue overlay */}
       <AnimatePresence>
         {inQueue && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center p-4"
           >
             <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
             <motion.div
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="premium-card w-full max-w-lg relative z-10 text-center"
             >
               {queueStatus?.status === 'searching' && (
                 <>
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                     className="w-24 h-24 rounded-full border-4 border-primary/30 border-t-primary mx-auto mb-6"
                   />
                   <h2 className="font-display text-2xl font-bold mb-2">Searching for Opponent</h2>
                   <p className="text-muted-foreground mb-6">
                     {queueStatus.size} players in queue • Est. wait: ~{queueStatus.estimated_wait}s
                   </p>
                   <div className="text-4xl font-mono font-bold text-primary mb-8">
                     {formatTime(searchTime)}
                   </div>
                   <button onClick={leaveQueue} className="btn-neon-ghost">
                     <X className="w-4 h-4" />
                     Cancel
                   </button>
                 </>
               )}
 
               {queueStatus?.status === 'found' && queueStatus.opponent && (
                 <>
                   <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="w-20 h-20 rounded-2xl bg-neon-green/15 border-2 border-neon-green flex items-center justify-center mx-auto mb-6"
                   >
                     <CheckCircle className="w-10 h-10 text-neon-green" />
                   </motion.div>
                   <h2 className="font-display text-2xl font-bold mb-6">Opponent Found!</h2>
                   
                   <div className="flex items-center justify-center gap-8 mb-8">
                     <div className="text-center">
                       <div className="w-16 h-16 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                         <Dna className="w-7 h-7 text-primary" />
                       </div>
                       <div className="font-medium">You</div>
                       <div className="text-sm text-muted-foreground">{selectedAlgo?.name}</div>
                       <div className="text-sm text-primary">{selectedAlgo?.rating} ELO</div>
                     </div>
                     
                     <div className="text-3xl font-bold text-muted-foreground">VS</div>
                     
                     <div className="text-center">
                       <div className="w-16 h-16 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                         <Swords className="w-7 h-7 text-accent" />
                       </div>
                       <div className="font-medium">{queueStatus.opponent.username}</div>
                       <div className="text-sm text-muted-foreground">{queueStatus.opponent.algorithm}</div>
                       <div className="text-sm text-accent">{queueStatus.opponent.rating} ELO</div>
                     </div>
                   </div>
                 </>
               )}
 
               {queueStatus?.status === 'starting' && (
                 <>
                   <motion.div
                     animate={{ scale: [1, 1.1, 1] }}
                     transition={{ duration: 0.5, repeat: Infinity }}
                     className="w-20 h-20 rounded-2xl bg-accent/15 border-2 border-accent flex items-center justify-center mx-auto mb-6"
                   >
                     <Swords className="w-10 h-10 text-accent" />
                   </motion.div>
                   <h2 className="font-display text-3xl font-bold text-accent">Battle Starting!</h2>
                   <p className="text-muted-foreground mt-3">Prepare your code...</p>
                 </>
               )}
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
 
       {/* Main content */}
       <div className="space-y-8">
         {/* Algorithm selection */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="premium-card"
         >
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center">
               <Dna className="w-5 h-5 text-primary" />
             </div>
             <h2 className="font-display text-lg font-bold">Select Algorithm</h2>
           </div>
 
           {loading ? (
             <div className="animate-pulse flex gap-4">
               <div className="w-20 h-20 bg-secondary rounded-xl" />
               <div className="flex-1 space-y-3">
                 <div className="h-5 bg-secondary rounded w-1/3" />
                 <div className="h-4 bg-secondary rounded w-1/4" />
               </div>
             </div>
           ) : algorithms.length === 0 ? (
             <div className="text-center py-10">
               <Dna className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
               <p className="text-muted-foreground mb-4">No active algorithms</p>
               <Link to="/algorithms" className="btn-neon-primary">
                 Create Algorithm
               </Link>
             </div>
           ) : (
             <div className="grid gap-3">
               {algorithms.map(algo => (
                 <button
                   key={algo.id}
                   onClick={() => setSelectedAlgo(algo)}
                   className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                     selectedAlgo?.id === algo.id
                       ? 'bg-primary/10 border-primary/50'
                       : 'bg-surface-2 border-border/40 hover:border-primary/30'
                   }`}
                 >
                   <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 border border-primary/30 flex items-center justify-center">
                     <Dna className="w-6 h-6 text-primary" />
                   </div>
                   <div className="flex-1">
                     <div className="font-medium">{algo.name}</div>
                     <div className="text-sm text-muted-foreground flex items-center gap-3">
                       <span className="flex items-center gap-1">
                         <Trophy className="w-3.5 h-3.5 text-accent" />
                         {algo.rating} ELO
                       </span>
                       <span className={algo.death_count === 2 ? 'text-destructive' : ''}>
                         ❤️ {3 - algo.death_count}/3
                       </span>
                     </div>
                   </div>
                   {selectedAlgo?.id === algo.id && (
                     <CheckCircle className="w-5 h-5 text-primary" />
                   )}
                 </button>
               ))}
             </div>
           )}
         </motion.div>
 
         {/* Mode selection */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="premium-card"
         >
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-accent/12 border border-accent/30 flex items-center justify-center">
               <Swords className="w-5 h-5 text-accent" />
             </div>
             <h2 className="font-display text-lg font-bold">Battle Mode</h2>
           </div>
 
           <div className="grid gap-3">
             {modes.map(m => (
               <button
                 key={m.id}
                 onClick={() => setMode(m.id)}
                 className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                   mode === m.id
                     ? 'bg-accent/10 border-accent/50'
                     : 'bg-surface-2 border-border/40 hover:border-accent/30'
                 }`}
               >
                 <m.icon className={`w-6 h-6 ${mode === m.id ? 'text-accent' : 'text-muted-foreground'}`} />
                 <div className="flex-1">
                   <div className="font-medium">{m.label}</div>
                   <div className="text-sm text-muted-foreground">{m.desc}</div>
                 </div>
                 {m.id === 'ranked_1v1' && selectedAlgo && selectedAlgo.death_count === 2 && (
                   <span className="text-xs text-destructive flex items-center gap-1">
                     <AlertTriangle className="w-3.5 h-3.5" />
                     Last life!
                   </span>
                 )}
               </button>
             ))}
           </div>
         </motion.div>
 
         {/* Difficulty selection */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="premium-card"
         >
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-neon-pink/12 border border-neon-pink/30 flex items-center justify-center">
               <Flame className="w-5 h-5 text-neon-pink" />
             </div>
             <h2 className="font-display text-lg font-bold">Problem Difficulty</h2>
           </div>
 
           <div className="flex gap-3">
             {difficulties.map(d => (
               <button
                 key={d.id}
                 onClick={() => setDifficulty(d.id)}
                 className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${
                   difficulty === d.id
                     ? `bg-${d.color}/15 border-${d.color}/50 text-${d.color}`
                     : 'bg-surface-2 border-border/40 text-muted-foreground hover:text-foreground'
                 }`}
               >
                 {d.label}
               </button>
             ))}
           </div>
         </motion.div>
 
         {/* Start button */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="text-center"
         >
           <button
             onClick={joinQueue}
             disabled={!selectedAlgo || inQueue}
             className="btn-neon-accent text-lg px-12 py-4"
           >
             <Swords className="w-5 h-5" />
             {inQueue ? 'Searching...' : 'Find Match'}
           </button>
           <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
             <Users className="w-4 h-4" />
             12 players online • ~30 second wait time
           </p>
         </motion.div>
       </div>
     </div>
   )
 }