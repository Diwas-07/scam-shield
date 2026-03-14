'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-dark rounded-lg p-3 text-xs border border-ink-border">
        <p className="font-mono text-muted mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

const radarData = [
  { subject: 'Phishing', A: 80 },
  { subject: 'Investment', A: 95 },
  { subject: 'Romance', A: 60 },
  { subject: 'Job Scams', A: 75 },
  { subject: 'Shopping', A: 65 },
  { subject: 'Tech Support', A: 45 },
  { subject: 'Crypto', A: 85 },
]

const emergingThreats = [
  { title: 'AI Voice Cloning Scams', trend: 'rising', change: '+340%', desc: 'Scammers clone the voices of family members using AI to request emergency funds via phone.', severity: 'critical' },
  { title: 'Deepfake Investment Ads', trend: 'rising', change: '+210%', desc: 'Fraudulent investment schemes use deepfake videos of celebrities to appear legitimate.', severity: 'high' },
  { title: 'Parcel Delivery Phishing', trend: 'rising', change: '+180%', desc: 'Fake SMS/WhatsApp notifications about held parcels lead to credential harvesting sites.', severity: 'high' },
  { title: 'Pig Butchering Scams', trend: 'stable', change: '+5%', desc: 'Long-term romance-investment hybrid scams where trust is built before financial exploitation.', severity: 'high' },
  { title: 'Lottery/Prize Notifications', trend: 'falling', change: '-12%', desc: 'Traditional prize scams declining as public awareness improves.', severity: 'medium' },
]

const weeklyData = [
  { day: 'Mon', reports: 28, loss: 38000 },
  { day: 'Tue', reports: 35, loss: 52000 },
  { day: 'Wed', reports: 42, loss: 67000 },
  { day: 'Thu', reports: 31, loss: 44000 },
  { day: 'Fri', reports: 49, loss: 78000 },
  { day: 'Sat', reports: 38, loss: 58000 },
  { day: 'Sun', reports: 22, loss: 29000 },
]

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-ink-border ${className}`} />
}

export default function TrendsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        if (!data.error) setStats(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 min-h-screen grid-bg">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-warn tracking-wider mb-2">INTELLIGENCE ANALYSIS</div>
          <h1 className="font-display font-black text-4xl text-frost">Trend Analysis</h1>
          <p className="text-muted-light mt-1 text-sm">Evolving scam tactics and emerging threat patterns</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-ink-border">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button key={p} onClick={() => setSelectedPeriod(p)}
              className={`px-4 py-2 text-xs font-mono transition-all ${selectedPeriod === p ? 'bg-acid text-ink' : 'text-muted hover:text-frost'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Emerging Threats */}
      <section className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle size={18} className="text-signal" />
          <h2 className="font-display font-bold text-xl text-frost">Emerging Threats</h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-signal/10 text-signal border border-signal/20">LIVE</span>
        </div>
        <div className="space-y-3">
          {emergingThreats.map((threat) => (
            <div key={threat.title} className="card-dark rounded-xl p-4 flex items-start gap-4 hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-2 mt-1">
                {threat.trend === 'rising' ? <TrendingUp size={16} className="text-signal" /> :
                 threat.trend === 'falling' ? <TrendingDown size={16} className="text-safe" /> :
                 <Minus size={16} className="text-warn" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display font-semibold text-frost">{threat.title}</h3>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${threat.severity === 'medium' ? 'badge-medium' : 'badge-high'}`}>
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed">{threat.desc}</p>
              </div>
              <div className={`text-sm font-mono font-bold ml-4 flex-shrink-0 ${
                threat.trend === 'rising' ? 'text-signal' : threat.trend === 'falling' ? 'text-safe' : 'text-warn'
              }`}>
                {threat.change}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2 card-dark rounded-2xl p-5">
          <h3 className="font-display font-bold text-frost mb-1">Weekly Pattern</h3>
          <p className="text-xs text-muted mb-4 font-mono">Reports by day of week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={24}>
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="reports" fill="#FF3B5C" radius={[4, 4, 0, 0]} name="reports" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-dark rounded-2xl p-5">
          <h3 className="font-display font-bold text-frost mb-1">Threat Intensity</h3>
          <p className="text-xs text-muted mb-2 font-mono">By scam category</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1E1E2A" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 9, fontFamily: 'Space Mono' }} />
              <Radar dataKey="A" stroke="#C8FF00" fill="#C8FF00" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card-dark rounded-2xl p-5">
          <h3 className="font-display font-bold text-frost mb-1">Report Volume Trend</h3>
          <p className="text-xs text-muted mb-4 font-mono">7-month rolling window</p>
          {loading ? <Skeleton className="h-[180px] w-full" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={stats?.monthlyTrend || []}>
                <defs>
                  <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B5C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF3B5C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="reports" stroke="#FF3B5C" strokeWidth={2} fill="url(#colorR)" name="reports" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-dark rounded-2xl p-5">
          <h3 className="font-display font-bold text-frost mb-1">Financial Loss Trend</h3>
          <p className="text-xs text-muted mb-4 font-mono">Monthly total losses (MYR)</p>
          {loading ? <Skeleton className="h-[180px] w-full" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={stats?.monthlyTrend || []}>
                <defs>
                  <linearGradient id="colorL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9500" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF9500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="loss" stroke="#FF9500" strokeWidth={2} fill="url(#colorL)" name="loss (MYR)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Scam Type Trends Table */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-ink-border">
          <h3 className="font-display font-bold text-frost">Scam Type Performance</h3>
          <p className="text-xs text-muted mt-0.5 font-mono">Ranked by report volume</p>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <table className="w-full table-dark">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Scam Type</th>
                <th className="text-left">Reports</th>
                <th className="text-left">Share</th>
                <th className="text-left">Trend</th>
                <th className="text-left">Visual</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.scamTypeBreakdown || []).map((item: any, i: number) => {
                const trends = ['+23%', '+14%', '+8%', '+31%', '+6%', '+45%', '+2%', '-3%']
                const trendVal = trends[i] || '+0%'
                const isUp = trendVal.startsWith('+')
                return (
                  <tr key={item.type}>
                    <td className="font-mono text-muted text-xs w-8">{i + 1}</td>
                    <td className="text-frost font-medium">{item.type}</td>
                    <td className="font-mono text-acid">{item.count}</td>
                    <td className="font-mono text-muted text-xs">{item.percentage}%</td>
                    <td>
                      <span className={`text-xs font-mono ${isUp ? 'text-signal' : 'text-safe'}`}>
                        {isUp ? '↑' : '↓'} {trendVal}
                      </span>
                    </td>
                    <td className="w-32">
                      <div className="h-1.5 bg-ink-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${item.percentage / 25 * 100}%`, background: isUp ? '#FF3B5C' : '#00D68F' }} />
                      </div>
                    </td>
                  </tr>
                )
              })}
              {(!stats?.scamTypeBreakdown?.length) && (
                <tr><td colSpan={6} className="text-center text-muted py-8 font-mono text-sm">No data available</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
