'use client'
import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, DollarSign, Users, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import StatCard from '@/components/StatCard'
import DemoBadge from '@/components/DemoBadge'
import { MOCK_STATS, MOCK_REPORTS } from '@/lib/mockData'

const COLORS = ['#C8FF00', '#FF3B5C', '#FF9500', '#00D68F', '#A78BFA', '#60A5FA', '#F472B6', '#34D399']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-dark rounded-lg p-3 text-xs border border-ink-border">
        <p className="font-mono text-muted mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {typeof p.value === 'number' && p.name?.includes('loss') 
              ? `RM ${p.value.toLocaleString()}` 
              : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState(MOCK_STATS)
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [isDemo, setIsDemo] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/reports?limit=8'),
        ])
        const statsData = await statsRes.json()
        const reportsData = await reportsRes.json()
        setStats(statsData)
        setReports(reportsData.reports || MOCK_REPORTS)
        setIsDemo(statsData.demo || false)
      } catch {
        setIsDemo(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="p-8 min-h-screen grid-bg">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-acid tracking-wider mb-2">ANALYTICS DASHBOARD</div>
          <h1 className="font-display font-black text-4xl text-frost">Live Intelligence</h1>
          <p className="text-muted-light mt-1 text-sm">Real-time scam data powered by AWS DynamoDB</p>
        </div>
        <div className="flex items-center gap-3">
          {isDemo && <DemoBadge />}
          <div className="flex items-center gap-2 font-mono text-xs text-muted px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(200, 255, 0, 0.05)', border: '1px solid rgba(200, 255, 0, 0.1)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" />
            Updated just now
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6 stagger-children">
        <StatCard
          label="Total Reports"
          value={stats.totalReports.toLocaleString()}
          icon={<AlertTriangle size={18} />}
          accent="signal"
          trend={{ value: 14.2, label: 'vs last month' }}
        />
        <StatCard
          label="Financial Losses"
          value={`RM ${(stats.totalLoss / 1000000).toFixed(2)}M`}
          icon={<DollarSign size={18} />}
          accent="warn"
          trend={{ value: 23.5, label: 'vs last month' }}
        />
        <StatCard
          label="This Week"
          value={stats.reportedThisWeek.toString()}
          icon={<TrendingUp size={18} />}
          accent="acid"
          trend={{ value: 8.7, label: 'vs last week' }}
        />
        <StatCard
          label="Avg Loss Per Victim"
          value={`RM ${stats.averageLoss.toLocaleString()}`}
          icon={<Users size={18} />}
          accent="signal"
        />
        <StatCard
          label="Top Scam Type"
          value={stats.topScamType}
          icon={<BarChart3 size={18} />}
          accent="warn"
        />
        <StatCard
          label="Cases Resolved"
          value={stats.resolvedCases.toString()}
          icon={<CheckCircle size={18} />}
          accent="safe"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        {/* Monthly Trend */}
        <div className="col-span-3 card-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-frost">Monthly Report Trend</h3>
              <p className="text-xs text-muted mt-0.5 font-mono">Reports & financial losses over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.monthlyTrend}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8FF00" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C8FF00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3B5C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF3B5C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="reports" stroke="#C8FF00" strokeWidth={2} fill="url(#colorReports)" name="reports" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Scam Type Pie */}
        <div className="col-span-2 card-dark rounded-2xl p-5">
          <h3 className="font-display font-bold text-frost mb-4">By Scam Type</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={stats.scamTypeBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                  dataKey="count" paddingAngle={2}>
                  {stats.scamTypeBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {stats.scamTypeBreakdown.slice(0, 5).map((item, i) => (
                <div key={item.type} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                  <span className="text-xs text-muted-light truncate">{item.type}</span>
                  <span className="text-xs font-mono text-muted ml-auto">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Platform Breakdown */}
        <div className="card-dark rounded-2xl p-5">
          <h3 className="font-display font-bold text-frost mb-4">Platform Breakdown</h3>
          <div className="space-y-3">
            {stats.platformBreakdown.map(({ platform, count, percentage }) => (
              <div key={platform}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-light">{platform}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted">{count}</span>
                    <span className="font-mono text-xs text-acid">{percentage}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-ink-border rounded-full overflow-hidden">
                  <div className="h-full progress-bar rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Breakdown */}
        <div className="card-dark rounded-2xl p-5">
          <h3 className="font-display font-bold text-frost mb-4">Victims by Age Group</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.ageBreakdown} barSize={28}>
              <XAxis dataKey="group" tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percentage" fill="#C8FF00" radius={[4, 4, 0, 0]} name="percentage" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-ink-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="pulse-dot" />
            <h3 className="font-display font-bold text-frost">Recent Reports</h3>
          </div>
          <a href="/report" className="btn-acid px-4 py-2 rounded-lg text-xs font-display uppercase tracking-wide">
            + New Report
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-dark">
            <thead>
              <tr>
                <th className="text-left">Scam Type</th>
                <th className="text-left">Platform</th>
                <th className="text-left">Loss (MYR)</th>
                <th className="text-left">Region</th>
                <th className="text-left">Status</th>
                <th className="text-left">Severity</th>
                <th className="text-left">Reported</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 8).map((report) => (
                <tr key={report.id}>
                  <td className="text-frost font-medium">{report.scamType}</td>
                  <td className="text-muted-light">{report.platform}</td>
                  <td className="font-mono text-warn">
                    {report.financialLoss > 0 ? `RM ${report.financialLoss.toLocaleString()}` : '—'}
                  </td>
                  <td className="text-muted">{report.region || '—'}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      report.status === 'verified' ? 'text-safe bg-safe/10' :
                      report.status === 'investigating' ? 'text-warn bg-warn/10' :
                      'text-muted bg-ink-border'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono badge-${report.severity}`}>
                      {report.severity}
                    </span>
                  </td>
                  <td className="text-muted font-mono text-xs">
                    {new Date(report.reportedAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
