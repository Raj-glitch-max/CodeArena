 import { motion } from 'framer-motion'
 import { Zap } from 'lucide-react'
 
 interface LoadingSpinnerProps {
   size?: 'sm' | 'md' | 'lg'
   text?: string
   fullScreen?: boolean
 }
 
 export function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
   const sizeClasses = {
     sm: 'w-8 h-8',
     md: 'w-12 h-12',
     lg: 'w-16 h-16',
   }
   
   const iconSizes = {
     sm: 'w-4 h-4',
     md: 'w-6 h-6',
     lg: 'w-8 h-8',
   }
   
   const content = (
     <div className="flex flex-col items-center gap-4">
       <motion.div
         className={`${sizeClasses[size]} rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center`}
         animate={{ 
           scale: [1, 1.1, 1],
           rotate: [0, 180, 360],
         }}
         transition={{ 
           duration: 2,
           repeat: Infinity,
           ease: "easeInOut"
         }}
       >
         <Zap className={`${iconSizes[size]} text-primary`} />
       </motion.div>
       {text && (
         <motion.p
           className="text-sm text-muted-foreground"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.3 }}
         >
           {text}
         </motion.p>
       )}
     </div>
   )
   
   if (fullScreen) {
     return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
         {content}
       </div>
     )
   }
   
   return content
 }