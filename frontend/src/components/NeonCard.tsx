import { ReactNode } from 'react'

export default function NeonCard({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`glass rounded-xl p-6 border border-white/10 shadow-glow ${className}`}>
      {children}
    </div>
  )
}
