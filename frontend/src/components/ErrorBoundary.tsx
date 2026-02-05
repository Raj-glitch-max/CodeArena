 import { Component, type ErrorInfo, type ReactNode } from 'react'
 import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
 import { Link } from 'react-router-dom'
 
 interface Props {
   children: ReactNode
   fallback?: ReactNode
 }
 
 interface State {
   hasError: boolean
   error: Error | null
   errorInfo: ErrorInfo | null
 }
 
 export class ErrorBoundary extends Component<Props, State> {
   constructor(props: Props) {
     super(props)
     this.state = { hasError: false, error: null, errorInfo: null }
   }
 
   static getDerivedStateFromError(error: Error): Partial<State> {
     return { hasError: true, error }
   }
 
   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
     this.setState({ errorInfo })
     // Log to error tracking service in production
     console.error('ErrorBoundary caught:', error, errorInfo)
   }
 
   handleRetry = () => {
     this.setState({ hasError: false, error: null, errorInfo: null })
   }
 
   render() {
     if (this.state.hasError) {
       if (this.props.fallback) {
         return this.props.fallback
       }
 
       return (
         <div className="min-h-screen flex items-center justify-center p-6 bg-background">
           <div className="max-w-md w-full text-center">
             <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center">
               <AlertTriangle className="w-10 h-10 text-destructive" />
             </div>
             
             <h1 className="font-display text-2xl font-bold mb-3">Something went wrong</h1>
             <p className="text-muted-foreground mb-8">
               An unexpected error occurred. Our team has been notified.
             </p>
             
             {process.env.NODE_ENV === 'development' && this.state.error && (
               <div className="mb-8 p-4 rounded-xl bg-surface-2 border border-border/60 text-left">
                 <p className="text-sm font-mono text-destructive mb-2">
                   {this.state.error.toString()}
                 </p>
                 {this.state.errorInfo && (
                   <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                     {this.state.errorInfo.componentStack}
                   </pre>
                 )}
               </div>
             )}
             
             <div className="flex flex-col sm:flex-row gap-3 justify-center">
               <button
                 onClick={this.handleRetry}
                 className="btn-neon-primary"
               >
                 <RefreshCw className="w-4 h-4" />
                 Try Again
               </button>
               <Link to="/" className="btn-neon-ghost">
                 <Home className="w-4 h-4" />
                 Go Home
               </Link>
             </div>
           </div>
         </div>
       )
     }
 
     return this.props.children
   }
 }