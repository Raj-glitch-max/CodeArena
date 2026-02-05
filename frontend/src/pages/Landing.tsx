import { Link } from 'react-router-dom'
 import { motion, type Easing } from 'framer-motion'
import { 
  Zap, Play, Trophy, Code, Shield, Sparkles, ArrowRight, 
  Eye, Flame, ChevronRight, Users, Clock, Cpu, Dna, Swords,
   BarChart3, Target, Star
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Landing() {
  const { user } = useAuth()
  
   const easeOut: Easing = [0.25, 0.1, 0.25, 1]
   
  const container = {
    hidden: { opacity: 1 },
     show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }
  const item = {
    hidden: { opacity: 0, y: 24 },
     show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  }
  
  return (
    <main className="relative overflow-hidden">
      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="relative min-h-screen flex items-center grid-bg">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {/* Floating particles */}
           {[...Array(15)].map((_, i) => (
             <motion.div
               key={`particle-${i}`}
               className="absolute w-1.5 h-1.5 rounded-full"
               style={{
                 left: `${10 + Math.random() * 80}%`,
                 top: `${10 + Math.random() * 80}%`,
                 background: i % 3 === 0 
                   ? `hsla(var(--primary), 0.4)` 
                   : i % 3 === 1 
                     ? `hsla(var(--accent), 0.4)`
                     : `hsla(var(--neon-pink), 0.4)`,
               }}
               animate={{
                 y: [0, -80 - Math.random() * 40, 0],
                 x: [0, Math.random() * 30 - 15, 0],
                 opacity: [0.2, 0.8, 0.2],
                 scale: [0.8, 1.3, 0.8],
               }}
               transition={{
                 duration: 6 + Math.random() * 6,
                 repeat: Infinity,
                 delay: Math.random() * 3,
                 ease: "easeInOut"
               }}
             />
           ))}
           
          <motion.div 
            className="absolute w-[800px] h-[800px] rounded-full"
            style={{ 
              top: '-25%', 
              left: '-15%',
              background: 'radial-gradient(circle, hsla(263, 70%, 50%, 0.25) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{ 
              x: [0, 80, 0],
              y: [0, 50, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div 
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{ 
              bottom: '-15%', 
              right: '-10%',
              background: 'radial-gradient(circle, hsla(188, 95%, 50%, 0.2) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{ 
              x: [0, -60, 0],
              y: [0, -40, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div 
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{ 
              top: '35%', 
              right: '15%',
              background: 'radial-gradient(circle, hsla(330, 85%, 60%, 0.15) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
            animate={{ 
              x: [0, 40, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left content */}
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div variants={item}>
                <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 border border-primary/30 text-primary mb-10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  The Neural Combat Network
                </span>
              </motion.div>
              
              <motion.h1 
                variants={item} 
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8"
              >
                Master coding through{' '}
                <span className="gradient-text">real-time battles</span>
              </motion.h1>
              
              <motion.p 
                variants={item}
                className="text-lg md:text-xl text-muted-foreground max-w-xl mb-12 leading-relaxed"
              >
                Algorithms that fight, evolve, and can die permanently. Compete in 1v1 battles, 
                climb leaderboards, and watch your code become a living organism in the arena.
              </motion.p>
              
              <motion.div variants={item} className="flex flex-wrap gap-4 mb-14">
                <Link to={user ? "/dashboard" : "/signup"} className="btn-neon-primary group">
                  <Zap className="w-5 h-5" />
                  <span>Start Battling</span>
                 <motion.span
                   animate={{ x: [0, 4, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                 >
                   <ArrowRight className="w-4 h-4" />
                 </motion.span>
                </Link>
                <Link to="/problems" className="btn-neon-ghost group">
                  <Play className="w-4 h-4" />
                  <span>See How It Works</span>
                </Link>
              </motion.div>
              
              {/* Social proof */}
             <motion.div
                variants={item}
               className="flex flex-wrap items-center gap-8 sm:gap-10 pt-10 border-t border-border/50"
              >
                <div>
                 <motion.div 
                   className="text-3xl font-bold text-accent font-display"
                   initial={{ opacity: 0, scale: 0.5 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ type: "spring", stiffness: 200 }}
                 >
                   50K+
                 </motion.div>
                  <div className="text-sm text-muted-foreground mt-0.5">Battles Fought</div>
                </div>
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div>
                 <motion.div 
                   className="text-3xl font-bold text-primary font-display"
                   initial={{ opacity: 0, scale: 0.5 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                 >
                   10K+
                 </motion.div>
                  <div className="text-sm text-muted-foreground mt-0.5">Active Coders</div>
                </div>
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div>
                 <motion.div 
                   className="text-3xl font-bold text-neon-pink font-display"
                   initial={{ opacity: 0, scale: 0.5 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                 >
                   99.7%
                 </motion.div>
                  <div className="text-sm text-muted-foreground mt-0.5">Uptime</div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right - App mockup */}
            <motion.div
              initial={{ opacity: 0, x: 60, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="relative"
            >
              {/* Main card */}
             <motion.div 
               className="premium-card overflow-hidden"
               animate={{ 
                 y: [0, -10, 0],
                 rotateZ: [0, 0.5, 0, -0.5, 0],
               }}
               transition={{ 
                 duration: 8, 
                 repeat: Infinity, 
                 ease: "easeInOut" 
               }}
             >
                {/* Window header */}
                <div className="flex items-center justify-between pb-5 border-b border-border/50 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="w-3 h-3 rounded-full bg-neon-yellow" />
                      <span className="w-3 h-3 rounded-full bg-neon-green" />
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">arena.live</span>
                  </div>
                  <div className="badge-status live">
                    <span className="text-2xs">LIVE</span>
                  </div>
                </div>
                
                {/* Code editor mockup */}
                <div className="bg-surface-2 rounded-xl p-4 font-mono text-sm mb-5 overflow-hidden border border-border/30">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/30">
                    <Code className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Solution.java</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-2xs text-green-400">REC</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-muted-foreground/40 select-none text-right w-5">
                      {Array.from({length: 9}, (_, i) => (
                        <div key={i} className="leading-6">{i + 1}</div>
                      ))}
                    </div>
                    <pre className="text-foreground/90 overflow-hidden">
                      <code className="leading-6 block">{`class Solution {
  public int maxProfit(int[] prices) {
    int minPrice = MAX_VALUE;
    int maxProfit = 0;
    for (int price : prices) {
      minPrice = min(minPrice, price);
      maxProfit = max(maxProfit, p);
    }
    return maxProfit;`}</code>
                    </pre>
                  </div>
                </div>
                
                {/* Stats panel */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-primary/8 border border-primary/25 rounded-xl p-4 text-center group hover:bg-primary/12 transition-colors">
                    <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold font-display">1,847</div>
                    <div className="text-2xs text-muted-foreground uppercase tracking-wide">ELO</div>
                  </div>
                  <div className="bg-accent/8 border border-accent/25 rounded-xl p-4 text-center group hover:bg-accent/12 transition-colors">
                    <Target className="w-5 h-5 text-accent mx-auto mb-2" />
                    <div className="text-xl font-bold font-display">68%</div>
                    <div className="text-2xs text-muted-foreground uppercase tracking-wide">Win Rate</div>
                  </div>
                  <div className="bg-neon-green/8 border border-neon-green/25 rounded-xl p-4 text-center group hover:bg-neon-green/12 transition-colors">
                    <Flame className="w-5 h-5 text-neon-green mx-auto mb-2" />
                    <div className="text-xl font-bold font-display">12</div>
                    <div className="text-2xs text-muted-foreground uppercase tracking-wide">Streak</div>
                  </div>
                </div>
             </motion.div>
              
              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
               transition={{ delay: 1.0, duration: 0.5, type: "spring" }}
                className="absolute -right-4 top-20 glass-strong rounded-xl p-4 shadow-premium max-w-[200px]"
              >
               <motion.div
                 animate={{ scale: [1, 1.02, 1] }}
                 transition={{ duration: 2, repeat: Infinity }}
               >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neon-green/15 border border-neon-green/30 flex items-center justify-center">
                    <Swords className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Victory!</div>
                    <div className="text-2xs text-muted-foreground">+24 ELO gained</div>
                  </div>
                </div>
               </motion.div>
              </motion.div>
              
              {/* Floating user cards */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
               transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
                className="absolute -left-6 bottom-24 glass-strong rounded-xl p-3 shadow-premium"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C'].map((initial, i) => (
                     <motion.div 
                        key={initial}
                        className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-2xs font-semibold"
                        style={{ 
                          background: `linear-gradient(135deg, hsl(${263 + i * 40} 70% 50%), hsl(${280 + i * 40} 70% 40%))`,
                          zIndex: 3 - i 
                        }}
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ delay: 1.4 + i * 0.1, type: "spring" }}
                      >
                        {initial}
                     </motion.div>
                    ))}
                  </div>
                 <motion.span 
                   className="text-xs text-muted-foreground live-indicator"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 1.7 }}
                 >
                   2,847 online
                 </motion.span>
                </div>
              </motion.div>
              
              {/* Decorative glow */}
              <div className="absolute -inset-8 bg-gradient-to-r from-primary/15 via-transparent to-accent/15 blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* ========================================
          FEATURES BENTO GRID
          ======================================== */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <span className="section-badge">
              <Sparkles className="w-3.5 h-3.5" /> 
              Features
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-5">
              Everything you need to{' '}
              <span className="gradient-text">dominate</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Battle live, level up your skills, and enjoy a premium coding experience designed for champions.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
            {/* Large feature card - Real-time battles */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="lg:col-span-2 lg:row-span-2 feature-card group"
            >
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/12 border border-accent/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Zap className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">Real-time Battles</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fight head-to-head with WebSocket-powered live updates. See your opponent's progress as they code in real-time.
                </p>
              </div>
              
              {/* Battle preview visualization */}
              <div className="space-y-5 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-xs font-bold">
                    Y
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">You</span>
                      <span className="text-sm text-accent font-mono">9/12</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill" 
                        initial={{ width: 0 }}
                        whileInView={{ width: '75%' }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-neon-pink/15 border border-neon-pink/30 flex items-center justify-center text-xs font-bold">
                    O
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-neon-pink">Opponent</span>
                      <span className="text-sm text-neon-pink font-mono">6/12</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-neon-pink to-rose-400 rounded-full" 
                        initial={{ width: 0 }}
                        whileInView={{ width: '50%' }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-8">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-full text-sm text-accent">
                  <Zap className="w-3.5 h-3.5" />
                  20Hz tick rate
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 border border-neon-green/30 rounded-full text-sm text-neon-green">
                  <Clock className="w-3.5 h-3.5" />
                  &lt;50ms latency
                </span>
              </div>
            </motion.div>
            
            {/* Feature cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="feature-card group hover:border-primary/40"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-display font-semibold text-lg mb-2">God Mode Replay</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Watch every keystroke and rewind any moment. Learn from the best.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="feature-card group hover:border-neon-pink/40"
            >
              <div className="w-12 h-12 rounded-xl bg-neon-pink/12 border border-neon-pink/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 text-neon-pink" />
              </div>
              <h4 className="font-display font-semibold text-lg mb-2">AI Roasts</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Get brutally honest code reviews that help you grow as a developer.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="feature-card group hover:border-accent/40"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/12 border border-accent/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-display font-semibold text-lg mb-2">Global Rankings</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Climb the ELO ladder and prove your dominance on the global stage.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="feature-card group hover:border-neon-green/40"
            >
              <div className="w-12 h-12 rounded-xl bg-neon-green/12 border border-neon-green/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-neon-green" />
              </div>
              <h4 className="font-display font-semibold text-lg mb-2">Fair Play</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Advanced anti-cheat systems keep every battle fair and competitive.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* ========================================
          ALGORITHM ORGANISMS SECTION
          ======================================== */}
      <section className="py-32 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Info */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-badge">
                <Dna className="w-3.5 h-3.5" /> 
                Living Algorithms
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Your code becomes a{' '}
                <span className="gradient-text">living organism</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Every algorithm you write gains traits, evolves through battles, and can permanently die. 
                Build your army of code warriors and dominate the arena.
              </p>
              
              <div className="space-y-5">
                {[
                  { icon: Cpu, title: 'Persistent Stats', desc: 'Speed, memory, adaptability, and resilience tracked per algorithm' },
                  { icon: Star, title: 'Unlock Traits', desc: 'Earn abilities like "Cache Warrior", "Phoenix", or "Giant Slayer"' },
                  { icon: Swords, title: 'Permadeath', desc: 'After 3 deaths, your algorithm is gone forever. Fight wisely.' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Right - Organism card mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="premium-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-accent flex items-center justify-center neon-glow-purple">
                      <Dna className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Binary Beast</h3>
                      <p className="text-sm text-muted-foreground">Generation 4 • Python</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent">1,923</div>
                    <div className="text-xs text-muted-foreground uppercase">ELO</div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Speed', value: 94, color: 'accent' },
                    { label: 'Memory', value: 87, color: 'neon-green' },
                    { label: 'Adaptability', value: 72, color: 'primary' },
                    { label: 'Resilience', value: 91, color: 'neon-pink' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-surface-2 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <span className="text-sm font-semibold">{stat.value}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full bg-${stat.color}`}
                          style={{ backgroundColor: `hsl(var(--${stat.color}))` }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Traits */}
                <div>
                  <div className="text-sm text-muted-foreground mb-3">Active Traits</div>
                  <div className="flex flex-wrap gap-2">
                    {['Cache Warrior', 'Speed Demon', 'Phoenix'].map((trait) => (
                      <span 
                        key={trait}
                        className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-xs font-medium text-primary"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Death counter */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Lives Remaining</span>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-neon-green" />
                    <span className="w-3 h-3 rounded-full bg-neon-green" />
                    <span className="w-3 h-3 rounded-full bg-muted/30" />
                  </div>
                </div>
              </div>
              
              {/* Decorative */}
              <div className="absolute -inset-8 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* ========================================
          HOW IT WORKS
          ======================================== */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">From signup to leaderboard domination in 3 simple steps</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { 
                num: '01', 
                icon: Users, 
                title: 'Queue for a match', 
                desc: 'Choose your difficulty and language. Our intelligent matchmaking pairs you with opponents of similar skill.' 
              },
              { 
                num: '02', 
                icon: Code, 
                title: 'Code in real-time', 
                desc: 'Solve the problem faster than your opponent. Watch their progress live as you race to submit the perfect solution.' 
              },
              { 
                num: '03', 
                icon: Trophy, 
                title: 'Win and evolve', 
                desc: 'Earn ELO points, unlock traits for your algorithms, and climb through ranks to reach the top.' 
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="feature-card relative group"
              >
                <span className="absolute -top-6 -right-2 text-8xl font-black text-primary/5 group-hover:text-primary/10 transition-colors font-display">
                  {step.num}
                </span>
                <div className="w-14 h-14 rounded-2xl bg-primary/12 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-full -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-primary/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ========================================
          FINAL CTA
          ======================================== */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="premium-card text-center py-20 px-8 relative overflow-hidden"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
            
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center mx-auto mb-8 neon-glow-purple"
              >
                <Swords className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Ready to enter the arena?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of developers battling in real-time. Your algorithms are waiting to evolve.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={user ? "/dashboard" : "/signup"} className="btn-neon-primary group">
                  <Zap className="w-5 h-5" />
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link to="/problems" className="btn-neon-ghost">
                  <BarChart3 className="w-4 h-4" />
                  <span>Browse Problems</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* ========================================
          FOOTER
          ======================================== */}
      <footer className="py-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">CodeArena</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="hover:text-foreground transition-colors">Careers</a>
              <a href="#" className="hover:text-foreground transition-colors">Discord</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 CodeArena. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
