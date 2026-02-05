 import { Link } from 'react-router-dom'
 import { motion } from 'framer-motion'
 import { Home, ArrowLeft } from 'lucide-react'
 
 export default function NotFound() {
   return (
     <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background effects */}
       <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" />
         <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
       </div>
       
       <motion.div 
         className="max-w-lg w-full text-center relative z-10"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
       >
         {/* 404 number */}
         <motion.div 
           className="relative mb-8"
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
         >
           <span className="text-[150px] md:text-[200px] font-display font-bold leading-none gradient-text">
             404
           </span>
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 rounded-full bg-primary/20 blur-2xl" />
           </div>
         </motion.div>
         
         <motion.h1 
           className="font-display text-2xl md:text-3xl font-bold mb-4"
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
         >
           Page not found
         </motion.h1>
         
         <motion.p 
           className="text-muted-foreground text-lg mb-10 max-w-md mx-auto"
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
         >
           The page you're looking for doesn't exist or has been moved to another dimension.
         </motion.p>
         
         <motion.div 
           className="flex flex-col sm:flex-row gap-4 justify-center"
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
         >
           <Link to="/" className="btn-neon-primary">
             <Home className="w-4 h-4" />
             Go Home
           </Link>
           <button 
             onClick={() => window.history.back()} 
             className="btn-neon-ghost"
           >
             <ArrowLeft className="w-4 h-4" />
             Go Back
           </button>
         </motion.div>
         
         {/* Quick links */}
         <motion.div 
           className="mt-12 pt-8 border-t border-border/40"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
         >
           <p className="text-sm text-muted-foreground mb-4">Looking for something?</p>
           <div className="flex flex-wrap gap-3 justify-center">
             <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-secondary/60 border border-border/60 text-sm hover:bg-secondary/80 hover:border-primary/30 transition-all">
               Dashboard
             </Link>
             <Link to="/problems" className="px-4 py-2 rounded-lg bg-secondary/60 border border-border/60 text-sm hover:bg-secondary/80 hover:border-primary/30 transition-all">
               Problems
             </Link>
             <Link to="/leaderboard" className="px-4 py-2 rounded-lg bg-secondary/60 border border-border/60 text-sm hover:bg-secondary/80 hover:border-primary/30 transition-all">
               Leaderboard
             </Link>
           </div>
         </motion.div>
       </motion.div>
     </div>
   )
 }