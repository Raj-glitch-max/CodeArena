 import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
 import { motion, AnimatePresence } from 'framer-motion'
 import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
 
 type ToastType = 'success' | 'error' | 'warning' | 'info'
 
 interface Toast {
   id: string
   type: ToastType
   title: string
   message?: string
   duration?: number
 }
 
 interface ToastContextType {
   toast: (options: Omit<Toast, 'id'>) => void
   success: (title: string, message?: string) => void
   error: (title: string, message?: string) => void
   warning: (title: string, message?: string) => void
   info: (title: string, message?: string) => void
 }
 
 const ToastContext = createContext<ToastContextType | null>(null)
 
 export function ToastProvider({ children }: { children: ReactNode }) {
   const [toasts, setToasts] = useState<Toast[]>([])
   
   const removeToast = useCallback((id: string) => {
     setToasts(prev => prev.filter(t => t.id !== id))
   }, [])
   
   const addToast = useCallback((options: Omit<Toast, 'id'>) => {
     const id = Math.random().toString(36).slice(2)
     const toast: Toast = { ...options, id }
     setToasts(prev => [...prev, toast])
     
     const duration = options.duration ?? 5000
     if (duration > 0) {
       setTimeout(() => removeToast(id), duration)
     }
   }, [removeToast])
   
   const value: ToastContextType = {
     toast: addToast,
     success: (title, message) => addToast({ type: 'success', title, message }),
     error: (title, message) => addToast({ type: 'error', title, message }),
     warning: (title, message) => addToast({ type: 'warning', title, message }),
     info: (title, message) => addToast({ type: 'info', title, message }),
   }
   
   return (
     <ToastContext.Provider value={value}>
       {children}
       <ToastContainer toasts={toasts} onRemove={removeToast} />
     </ToastContext.Provider>
   )
 }
 
 export function useToast() {
   const ctx = useContext(ToastContext)
   if (!ctx) throw new Error('useToast must be used within ToastProvider')
   return ctx
 }
 
 function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
   const icons = {
     success: CheckCircle,
     error: XCircle,
     warning: AlertCircle,
     info: Info,
   }
   
   const colors = {
     success: 'bg-neon-green/15 border-neon-green/30 text-neon-green',
     error: 'bg-destructive/15 border-destructive/30 text-destructive',
     warning: 'bg-neon-yellow/15 border-neon-yellow/30 text-neon-yellow',
     info: 'bg-accent/15 border-accent/30 text-accent',
   }
   
   return (
     <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
       <AnimatePresence>
         {toasts.map(toast => {
           const Icon = icons[toast.type]
           return (
             <motion.div
               key={toast.id}
               initial={{ opacity: 0, y: 20, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, x: 100, scale: 0.95 }}
               className="pointer-events-auto"
             >
               <div className={`glass-strong rounded-xl p-4 border ${colors[toast.type].split(' ').slice(1).join(' ')}`}>
                 <div className="flex items-start gap-3">
                   <div className={`w-8 h-8 rounded-lg ${colors[toast.type].split(' ').slice(0, 2).join(' ')} flex items-center justify-center shrink-0`}>
                     <Icon className="w-4 h-4" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-semibold text-foreground">{toast.title}</p>
                     {toast.message && (
                       <p className="text-sm text-muted-foreground mt-0.5">{toast.message}</p>
                     )}
                   </div>
                   <button
                     onClick={() => onRemove(toast.id)}
                     className="p-1 rounded-lg hover:bg-secondary/60 transition-colors"
                   >
                     <X className="w-4 h-4 text-muted-foreground" />
                   </button>
                 </div>
               </div>
             </motion.div>
           )
         })}
       </AnimatePresence>
     </div>
   )
 }