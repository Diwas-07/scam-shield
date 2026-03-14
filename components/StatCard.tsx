'use client'
import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: ReactNode
  accent?: 'acid' | 'signal' | 'warn' | 'safe'
  trend?: { value: number; label: string }
}

const accentStyles = {
  acid: { color: '#C8FF00', bg: 'rgba(200, 255, 0, 0.08)', border: 'rgba(200, 255, 0, 0.15)' },
  signal: { color: '#FF3B5C', bg: 'rgba(255, 59, 92, 0.08)', border: 'rgba(255, 59, 92, 0.15)' },
  warn: { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.08)', border: 'rgba(255, 149, 0, 0.15)' },
  safe: { color: '#00D68F', bg: 'rgba(0, 214, 143, 0.08)', border: 'rgba(0, 214, 143, 0.15)' },
}

export default function StatCard({ label, value, sub, icon, accent = 'acid', trend }: StatCardProps) {
  const style = accentStyles[accent]
  
  return (
    <div className="card-dark rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at top right, ${style.bg} 0%, transparent 60%)` }} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
            <div style={{ color: style.color }}>{icon}</div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full ${
              trend.value >= 0 ? 'text-signal bg-signal/10' : 'text-safe bg-safe/10'
            }`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        <div className="mb-1">
          <span className="font-display font-bold text-2xl text-frost tracking-tight">{value}</span>
        </div>
        
        <div className="text-xs text-muted font-mono uppercase tracking-wider">{label}</div>
        
        {sub && (
          <div className="text-xs text-muted-light mt-1">{sub}</div>
        )}
      </div>
    </div>
  )
}
