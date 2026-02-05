 import { useEffect, useState } from 'react'
 import { motion, AnimatePresence } from 'framer-motion'
 import { apiClient } from '@/services/apiClient'
 import { Link } from 'react-router-dom'
 import {
   Dna, Plus, Swords, Trophy, Skull, Heart,
   Sparkles, Zap, Shield, Target,
   Star, AlertTriangle, Code
 } from 'lucide-react'
 
 interface AlgorithmTrait {
   id: string
   name: string
   description: string
   rarity: 'common' | 'rare' | 'epic' | 'legendary'
 }
 
 interface Algorithm {
   id: number
   name: string
   language: string
   battles_won: number
   battles_lost: number
   rating: number
   is_alive: boolean
   death_count: number
   generation: number
   traits: AlgorithmTrait[]
   speed_score: number
   memory_score: number
   adaptability_score: number
   resilience_score: number
   created_at: string
 }
 
 export default function Algorithms() {
   const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
   const [loading, setLoading] = useState(true)
   const [selectedAlgo, setSelectedAlgo] = useState<Algorithm | null>(null)
   const [showCreateModal, setShowCreateModal] = useState(false)
 
   useEffect(() => {
     apiClient.get('/api/v1/algorithms')
       .then(r => setAlgorithms(r.data.data || []))
       .catch(() => {
         // Mock data for demo
         setAlgorithms([
           {
             id: 1,
             name: 'Phoenix Rising',
             language: 'python',
             battles_won: 42,
             battles_lost: 8,
             rating: 1847,
             is_alive: true,
             death_count: 1,
             generation: 3,
             traits: [
               { id: 'phoenix', name: 'Phoenix', description: 'Survives one fatal loss per day', rarity: 'legendary' },
               { id: 'cache_warrior', name: 'Cache Warrior', description: 'Boosted performance on repeated inputs', rarity: 'rare' },
             ],
             speed_score: 87,
             memory_score: 72,
             adaptability_score: 91,
             resilience_score: 68,
             created_at: '2024-01-15',
           },
           {
             id: 2,
             name: 'Shadow Recursion',
             language: 'python',
             battles_won: 28,
             battles_lost: 15,
             rating: 1623,
             is_alive: true,
             death_count: 2,
             generation: 1,
             traits: [
               { id: 'memory_monk', name: 'Memory Monk', description: 'Reduced memory usage', rarity: 'epic' },
             ],
             speed_score: 65,
             memory_score: 94,
             adaptability_score: 58,
             resilience_score: 81,
             created_at: '2024-02-01',
           },
           {
             id: 3,
             name: 'Fallen Warrior',
             language: 'javascript',
             battles_won: 18,
             battles_lost: 22,
             rating: 1245,
             is_alive: false,
             death_count: 3,
             generation: 2,
             traits: [
               { id: 'chaos_adapter', name: 'Chaos Adapter', description: 'Improved results on randomized tests', rarity: 'common' },
             ],
             speed_score: 54,
             memory_score: 61,
             adaptability_score: 78,
             resilience_score: 42,
             created_at: '2024-01-20',
           },
         ])
       })
       .finally(() => setLoading(false))
   }, [])
 
   const getTraitColor = (rarity: string) => {
     const colors: Record<string, string> = {
       common: 'text-muted-foreground bg-secondary border-border',
       rare: 'text-accent bg-accent/10 border-accent/30',
       epic: 'text-primary bg-primary/10 border-primary/30',
       legendary: 'text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30',
     }
     return colors[rarity] || colors.common
   }
 
   const getHealthColor = (deathCount: number, isAlive: boolean) => {
     if (!isAlive) return 'text-muted-foreground'
     if (deathCount === 0) return 'text-neon-green'
     if (deathCount === 1) return 'text-neon-yellow'
     return 'text-destructive'
   }
 
   const aliveAlgos = algorithms.filter(a => a.is_alive)
   const deadAlgos = algorithms.filter(a => !a.is_alive)
 
   return (
     <div className="page-shell pt-8">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
         >
           <span className="section-badge mb-4">
             <Dna className="w-3.5 h-3.5" />
             Your Organisms
           </span>
           <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Algorithm Lab</h1>
           <p className="text-muted-foreground">Create, evolve, and manage your living algorithms</p>
         </motion.div>
 
         <motion.button
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           onClick={() => setShowCreateModal(true)}
           className="btn-neon-primary shrink-0"
         >
           <Plus className="w-4 h-4" />
           Create Algorithm
         </motion.button>
       </div>
 
       {/* Stats overview */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.15 }}
         className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
       >
         {[
           { icon: Dna, label: 'Active', value: aliveAlgos.length, color: 'primary' },
           { icon: Trophy, label: 'Total Wins', value: algorithms.reduce((a, b) => a + b.battles_won, 0), color: 'accent' },
           { icon: Skull, label: 'Fallen', value: deadAlgos.length, color: 'muted-foreground' },
           { icon: Star, label: 'Traits Unlocked', value: algorithms.reduce((a, b) => a + b.traits.length, 0), color: 'neon-yellow' },
         ].map((stat) => (
           <div key={stat.label} className="premium-card text-center">
             <stat.icon className={`w-6 h-6 text-${stat.color} mx-auto mb-2`} />
             <div className="text-2xl font-bold font-display">{stat.value}</div>
             <div className="text-sm text-muted-foreground">{stat.label}</div>
           </div>
         ))}
       </motion.div>
 
       {/* Main content */}
       <div className="grid lg:grid-cols-3 gap-6">
         {/* Algorithms list */}
         <div className="lg:col-span-2 space-y-6">
           {/* Active Algorithms */}
           <div>
             <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
               <Heart className="w-5 h-5 text-neon-green" />
               Active Organisms ({aliveAlgos.length})
             </h2>
             
             {loading ? (
               <div className="space-y-4">
                 {[1, 2].map(i => (
                   <div key={i} className="premium-card animate-pulse">
                     <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-secondary rounded-xl" />
                       <div className="flex-1">
                         <div className="h-5 bg-secondary rounded w-1/3 mb-3" />
                         <div className="h-4 bg-secondary rounded w-1/4" />
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : aliveAlgos.length === 0 ? (
               <div className="premium-card text-center py-16">
                 <Dna className="w-14 h-14 text-muted-foreground/40 mx-auto mb-5" />
                 <h3 className="font-display text-xl font-semibold mb-2">No active algorithms</h3>
                 <p className="text-muted-foreground mb-6">Create your first algorithm to start battling</p>
                 <button onClick={() => setShowCreateModal(true)} className="btn-neon-primary">
                   <Plus className="w-4 h-4" />
                   Create Algorithm
                 </button>
               </div>
             ) : (
               <div className="space-y-4">
                 {aliveAlgos.map((algo, i) => (
                   <motion.div
                     key={algo.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     onClick={() => setSelectedAlgo(algo)}
                     className={`premium-card cursor-pointer group hover:border-primary/40 ${selectedAlgo?.id === algo.id ? 'border-primary/60' : ''}`}
                   >
                     <div className="flex items-start gap-5">
                       {/* Avatar */}
                       <div className="relative">
                         <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 border border-primary/30 flex items-center justify-center">
                           <Dna className="w-7 h-7 text-primary" />
                         </div>
                         {algo.generation > 1 && (
                           <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-accent-foreground rounded-full text-xs font-bold flex items-center justify-center">
                             G{algo.generation}
                           </span>
                         )}
                       </div>
 
                       {/* Info */}
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3 mb-2">
                           <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                             {algo.name}
                           </h3>
                           <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                             {algo.language}
                           </span>
                         </div>
 
                         <div className="flex items-center gap-4 text-sm mb-3">
                           <span className="flex items-center gap-1.5">
                             <Trophy className="w-4 h-4 text-accent" />
                             <span className="font-semibold">{algo.rating}</span>
                             <span className="text-muted-foreground">ELO</span>
                           </span>
                           <span className="text-neon-green">{algo.battles_won}W</span>
                           <span className="text-destructive">{algo.battles_lost}L</span>
                           <span className={`flex items-center gap-1 ${getHealthColor(algo.death_count, algo.is_alive)}`}>
                             <Heart className="w-3.5 h-3.5" />
                             {3 - algo.death_count}/3
                           </span>
                         </div>
 
                         {/* Traits */}
                         <div className="flex flex-wrap gap-2">
                           {algo.traits.map(trait => (
                             <span
                               key={trait.id}
                               className={`text-xs px-2.5 py-1 rounded-lg border ${getTraitColor(trait.rarity)}`}
                               title={trait.description}
                             >
                               {trait.name}
                             </span>
                           ))}
                         </div>
                       </div>
 
                       {/* Action */}
                       <Link to="/arena" className="btn-neon-ghost text-sm py-2.5 px-4 shrink-0">
                         <Swords className="w-4 h-4" />
                         Battle
                       </Link>
                     </div>
                   </motion.div>
                 ))}
               </div>
             )}
           </div>
 
           {/* Dead Algorithms */}
           {deadAlgos.length > 0 && (
             <div>
               <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                 <Skull className="w-5 h-5" />
                 Fallen Warriors ({deadAlgos.length})
               </h2>
               <div className="space-y-3">
                 {deadAlgos.map((algo, i) => (
                   <motion.div
                     key={algo.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.3 + i * 0.05 }}
                     className="premium-card opacity-60 hover:opacity-80 transition-opacity"
                   >
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border/40 flex items-center justify-center">
                         <Skull className="w-5 h-5 text-muted-foreground" />
                       </div>
                       <div className="flex-1">
                         <h3 className="font-medium text-muted-foreground">{algo.name}</h3>
                         <div className="text-sm text-muted-foreground">
                           {algo.battles_won}W / {algo.battles_lost}L • Peak: {algo.rating} ELO
                         </div>
                       </div>
                       <span className="text-xs text-muted-foreground">PERMADEATH</span>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </div>
           )}
         </div>
 
         {/* Detail panel */}
         <div className="lg:col-span-1">
           <AnimatePresence mode="wait">
             {selectedAlgo ? (
               <motion.div
                 key={selectedAlgo.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="premium-card sticky top-24"
               >
                 <div className="text-center mb-6 pb-6 border-b border-border/40">
                   <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 border-2 border-primary/50 flex items-center justify-center mx-auto mb-4">
                     <Dna className="w-10 h-10 text-primary" />
                   </div>
                   <h3 className="font-display text-2xl font-bold">{selectedAlgo.name}</h3>
                   <div className="text-sm text-muted-foreground mt-1">Generation {selectedAlgo.generation}</div>
                 </div>
 
                 {/* Stats */}
                 <div className="space-y-4 mb-6">
                   {[
                     { icon: Zap, label: 'Speed', value: selectedAlgo.speed_score, color: 'accent' },
                     { icon: Target, label: 'Memory', value: selectedAlgo.memory_score, color: 'primary' },
                     { icon: Shield, label: 'Adaptability', value: selectedAlgo.adaptability_score, color: 'neon-green' },
                     { icon: Heart, label: 'Resilience', value: selectedAlgo.resilience_score, color: 'neon-pink' },
                   ].map(stat => (
                     <div key={stat.label}>
                       <div className="flex items-center justify-between mb-1.5">
                         <span className="text-sm flex items-center gap-2">
                           <stat.icon className={`w-4 h-4 text-${stat.color}`} />
                           {stat.label}
                         </span>
                         <span className="text-sm font-medium">{stat.value}</span>
                       </div>
                       <div className="progress-bar h-2">
                         <div className="progress-fill" style={{ width: `${stat.value}%` }} />
                       </div>
                     </div>
                   ))}
                 </div>
 
                 {/* Health */}
                 <div className="p-4 rounded-xl bg-surface-2 border border-border/40 mb-6">
                   <div className="flex items-center justify-between mb-3">
                     <span className="text-sm font-medium">Life Status</span>
                     <span className={`text-sm ${getHealthColor(selectedAlgo.death_count, selectedAlgo.is_alive)}`}>
                       {selectedAlgo.is_alive ? `${3 - selectedAlgo.death_count} lives remaining` : 'DEAD'}
                     </span>
                   </div>
                   <div className="flex gap-2">
                     {[0, 1, 2].map(i => (
                       <div
                         key={i}
                         className={`flex-1 h-3 rounded-full ${i < (3 - selectedAlgo.death_count) 
                           ? selectedAlgo.is_alive ? 'bg-neon-green' : 'bg-muted-foreground'
                           : 'bg-secondary'
                         }`}
                       />
                     ))}
                   </div>
                   {selectedAlgo.death_count > 0 && selectedAlgo.is_alive && (
                     <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
                       <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                       {selectedAlgo.death_count === 2 
                         ? 'One more death and this algorithm dies permanently!'
                         : `Lost ${selectedAlgo.death_count} ranked battle(s)`
                       }
                     </p>
                   )}
                 </div>
 
                 {/* Traits */}
                 <div className="mb-6">
                   <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                     <Sparkles className="w-4 h-4 text-neon-yellow" />
                     Traits
                   </h4>
                   {selectedAlgo.traits.length === 0 ? (
                     <p className="text-sm text-muted-foreground">No traits unlocked yet</p>
                   ) : (
                     <div className="space-y-2">
                       {selectedAlgo.traits.map(trait => (
                         <div
                           key={trait.id}
                           className={`p-3 rounded-xl border ${getTraitColor(trait.rarity)}`}
                         >
                           <div className="font-medium text-sm">{trait.name}</div>
                           <div className="text-xs opacity-70 mt-1">{trait.description}</div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
 
                 {/* Actions */}
                 <div className="space-y-3">
                   <Link to="/arena" className="btn-neon-primary w-full justify-center">
                     <Swords className="w-4 h-4" />
                     Enter Battle
                   </Link>
                   <button className="btn-neon-ghost w-full justify-center">
                     <Code className="w-4 h-4" />
                     View Code
                   </button>
                 </div>
               </motion.div>
             ) : (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="premium-card text-center py-16 sticky top-24"
               >
                 <Dna className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                 <p className="text-muted-foreground">Select an algorithm to view details</p>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
       </div>
 
       {/* Create Modal */}
       <AnimatePresence>
         {showCreateModal && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center p-4"
             onClick={() => setShowCreateModal(false)}
           >
             <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
             <motion.div
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               onClick={e => e.stopPropagation()}
               className="premium-card w-full max-w-md relative z-10"
             >
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center">
                   <Dna className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                   <h3 className="font-display text-xl font-bold">Create Algorithm</h3>
                   <p className="text-sm text-muted-foreground">Birth a new organism</p>
                 </div>
               </div>
 
               <div className="space-y-5">
                 <div>
                   <label className="text-sm font-medium mb-2.5 block">Name</label>
                   <input
                     type="text"
                     placeholder="e.g., Phoenix Rising"
                     className="premium-input"
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium mb-2.5 block">Language</label>
                   <select className="premium-input">
                     <option value="python">Python</option>
                     <option value="javascript">JavaScript</option>
                     <option value="java">Java</option>
                     <option value="cpp">C++</option>
                   </select>
                 </div>
                 <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                   <p className="text-sm text-accent">
                     <strong>⚠️ Warning:</strong> Each algorithm has only 3 lives. 
                     If it loses 3 ranked battles, it dies permanently.
                   </p>
                 </div>
               </div>
 
               <div className="flex gap-3 mt-8">
                 <button onClick={() => setShowCreateModal(false)} className="btn-neon-ghost flex-1">
                   Cancel
                 </button>
                 <button className="btn-neon-primary flex-1">
                   <Plus className="w-4 h-4" />
                   Create
                 </button>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   )
 }