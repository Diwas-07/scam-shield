import Link from 'next/link'
import { NextRequest } from 'next/server'
import { Shield, AlertTriangle, BarChart3, BookOpen, ArrowRight, TrendingUp, Users, Globe } from 'lucide-react'

async function getStats() {
  try {
    const { GET } = await import('@/app/api/stats/route')
    const res = await GET()
    return res.json()
  } catch {
    return null
  }
}

async function getRecentReports(limit = 7) {
  try {
    const { GET } = await import('@/app/api/reports/route')
    const url = new URL(`http://n/?limit=${limit}&page=1`)
    const res = await GET(new NextRequest(url))
    const data = await res.json()
    return data.reports ?? []
  } catch {
    return []
  }
}

const features = [
  {
    href: '/report',
    icon: AlertTriangle,
    title: 'Report a Scam',
    desc: 'Encountered a scam? Document it here. Your report helps protect others and creates data for pattern analysis.',
    accent: '#FF3B5C',
    tag: 'ACTION',
  },
  {
    href: '/dashboard',
    icon: BarChart3,
    title: 'Live Dashboard',
    desc: 'Real-time analytics showing scam trends, platform breakdowns, and financial impact across the region.',
    accent: '#C8FF00',
    tag: 'ANALYTICS',
  },
  {
    href: '/trends',
    icon: TrendingUp,
    title: 'Trend Analysis',
    desc: 'Track how scam tactics evolve over time. Understand seasonal patterns and emerging threats.',
    accent: '#FF9500',
    tag: 'INTELLIGENCE',
  },
  {
    href: '/learn',
    icon: BookOpen,
    title: 'Learn & Protect',
    desc: 'Comprehensive guides on identifying scams, protecting vulnerable groups, and reporting to authorities.',
    accent: '#00D68F',
    tag: 'EDUCATION',
  },
]


export default async function HomePage() {
  const [data, recentReports] = await Promise.all([getStats(), getRecentReports()])

  const totalReports = data?.totalReports ?? 0
  const totalLoss = data?.totalLoss ?? 0
  const resolvedCases = data?.resolvedCases ?? 0

  const stats = [
    { value: totalReports.toLocaleString(), label: 'Reports This Month', icon: AlertTriangle },
    { value: `RM ${(totalLoss / 1_000_000).toFixed(2)}M`, label: 'Total Losses Tracked', icon: TrendingUp },
    { value: '12', label: 'Scam Types Monitored', icon: Globe },
    { value: resolvedCases.toLocaleString(), label: 'Cases Resolved', icon: Users },
  ]
  return (
    <div className="min-h-screen grid-bg">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-8 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C8FF00 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 left-40 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #FF3B5C 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 font-mono text-xs"
            style={{ background: 'rgba(200, 255, 0, 0.08)', border: '1px solid rgba(200, 255, 0, 0.2)', color: '#C8FF00' }}>
            <span className="w-2 h-2 rounded-full bg-acid animate-pulse" />
            SYSTEM ACTIVE — {totalReports.toLocaleString()} incidents catalogued
          </div>

          <h1 className="font-display font-black text-6xl leading-none text-frost mb-6 text-center">
            FIGHT BACK
            <br />
            <span className="text-acid text-glow-acid">AGAINST SCAMS.</span>
          </h1>
          
          <p className="text-muted-light text-xl max-w-2xl leading-relaxed mb-10 mx-auto text-center">
            A centralized platform to report, track, and understand online scams in real-time. 
            Built for communities, powered by AWS DynamoDB on EC2, deployed for impact.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/report">
              <button className="btn-acid px-8 py-4 rounded-xl text-sm tracking-wide flex items-center gap-2 font-display uppercase">
                Report a Scam
                <AlertTriangle size={16} />
              </button>
            </Link>
            <Link href="/register">
              <button className="btn-outline px-8 py-4 rounded-xl text-sm tracking-wide flex items-center gap-2 font-display uppercase">
                Register Now
                <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="btn-outline px-8 py-4 rounded-xl text-sm tracking-wide flex items-center gap-2 font-display uppercase">
                View Dashboard
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-8 pb-12">
        <div className="grid grid-cols-4 gap-4">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="card-dark rounded-2xl p-5 group hover:-translate-y-0.5 transition-transform">
              <Icon size={18} className="text-acid mb-3" />
              <div className="font-display font-black text-2xl text-frost">{value}</div>
              <div className="text-xs text-muted font-mono mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 pb-16">
        <div className="mb-8">
          <h2 className="font-display font-bold text-3xl text-frost">Platform Features</h2>
          <p className="text-muted-light mt-2">Everything you need to understand and combat online scams</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {features.map(({ href, icon: Icon, title, desc, accent, tag }) => (
            <Link key={href} href={href}>
              <div className="card-dark rounded-2xl p-6 h-full group cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `radial-gradient(ellipse at top left, ${accent}10 0%, transparent 50%)` }} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                      <Icon size={20} style={{ color: accent }} />
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded-full"
                      style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-frost mb-2 group-hover:text-white transition-colors">{title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                  <div className="flex items-center gap-2 mt-4 text-sm font-medium transition-colors"
                    style={{ color: accent }}>
                    Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Alerts Feed */}
      <section className="px-8 pb-16">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="card-dark rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-ink-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="pulse-dot" />
                  <h3 className="font-display font-bold text-frost">Recent Scam Reports</h3>
                </div>
                <Link href="/dashboard" className="text-xs text-acid hover:underline font-mono">VIEW ALL →</Link>
              </div>
              <table className="w-full table-dark">
                <thead>
                  <tr>
                    <th className="text-left">Type</th>
                    <th className="text-left">Platform</th>
                    <th className="text-left">Reported</th>
                    <th className="text-left">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((r: any) => (
                    <tr key={r.id}>
                      <td className="text-frost font-medium">{r.scamType}</td>
                      <td className="text-muted-light">{r.platform}</td>
                      <td className="text-muted font-mono text-xs">
                        {new Date(r.reportedAt).toLocaleString('en-MY', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-mono badge-${r.severity}`}>
                          {r.severity.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="space-y-4">
            <div className="card-dark rounded-2xl p-5" style={{ borderColor: 'rgba(255, 59, 92, 0.2)' }}>
              <AlertTriangle size={24} className="text-signal mb-3" />
              <h4 className="font-display font-bold text-frost mb-2">Have you been scammed?</h4>
              <p className="text-muted text-sm mb-4 leading-relaxed">
                Your report helps others. It only takes 3 minutes and can be anonymous.
              </p>
              <Link href="/report">
                <button className="w-full btn-acid py-2.5 rounded-lg text-sm font-display uppercase tracking-wide">
                  Report Now
                </button>
              </Link>
            </div>

            <div className="card-dark rounded-2xl p-5">
              <Shield size={24} className="text-acid mb-3" />
              <h4 className="font-display font-bold text-frost mb-2">Stay Protected</h4>
              <p className="text-muted text-sm mb-4 leading-relaxed">
                Learn to identify common scam tactics before they target you.
              </p>
              <Link href="/learn">
                <button className="w-full btn-outline py-2.5 rounded-lg text-sm font-display uppercase tracking-wide">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AWS Architecture Note */}
      <section className="px-8 pb-16">
        <div>
          <div className="card-dark rounded-2xl p-6" style={{ borderColor: 'rgba(200, 255, 0, 0.1)' }}>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-acid/10 flex-shrink-0">
                <Shield size={20} className="text-acid" />
              </div>
              <div>
                <div className="font-mono text-xs text-acid mb-1 tracking-wider">Backend by DynamoDB. Deployed on EC2.</div>
                <h3 className="font-display font-bold text-frost mb-2">Production-Ready Cloud Infrastructure</h3>
                <p className="text-muted text-sm leading-relaxed max-w-3xl">
                  ScamShield leverages AWS DynamoDB for reliable, scalable NoSQL database storage of scam reports. 
                  The Next.js application is containerized and deployed via AWS EC2 for 
                  high availability. All API routes are secured and data is encrypted at rest.
                </p>
                <div className="flex items-center gap-6 mt-4 flex-wrap">
                  {['AWS DynamoDB', 'EC2', 'Next.js 14', 'TypeScript'].map(tech => (
                    <span key={tech} className="text-xs font-mono text-muted-light px-2 py-1 rounded-md"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E1E2A' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
