import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { MOCK_STATS } from '@/lib/mockData'

const USE_MOCK = !process.env.RDS_HOST || process.env.USE_MOCK_DATA === 'true'

export async function GET() {
  if (USE_MOCK) {
    return NextResponse.json({ ...MOCK_STATS, demo: true })
  }

  try {
    const [reports]: any = await pool.query(`SELECT * FROM scam_reports`)

    const totalLoss = reports.reduce((sum: number, r: any) => sum + parseFloat(r.financial_loss || 0), 0)

    const scamTypeCounts: Record<string, number> = {}
    reports.forEach((r: any) => {
      scamTypeCounts[r.scam_type] = (scamTypeCounts[r.scam_type] || 0) + 1
    })

    const scamTypeBreakdown = Object.entries(scamTypeCounts)
      .map(([type, count]) => ({
        type, count,
        percentage: Math.round((count / reports.length) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const reportedThisWeek = reports.filter((r: any) => r.reported_at > oneWeekAgo).length

    // Platform breakdown
    const platformCounts: Record<string, number> = {}
    reports.forEach((r: any) => {
      platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1
    })
    const platformBreakdown = Object.entries(platformCounts)
      .map(([platform, count]) => ({
        platform, count,
        percentage: reports.length > 0 ? Math.round((count / reports.length) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Age breakdown
    const ageCounts: Record<string, number> = {}
    reports.forEach((r: any) => {
      const group = r.victim_age || 'Unknown'
      ageCounts[group] = (ageCounts[group] || 0) + 1
    })
    const ageBreakdown = Object.entries(ageCounts)
      .map(([group, count]) => ({
        group, count,
        percentage: reports.length > 0 ? Math.round((count / reports.length) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Monthly trend (last 6 months)
    const monthlyMap: Record<string, { reports: number; loss: number }> = {}
    reports.forEach((r: any) => {
      const month = new Date(r.reported_at).toLocaleString('en-US', { month: 'short', year: '2-digit' })
      if (!monthlyMap[month]) monthlyMap[month] = { reports: 0, loss: 0 }
      monthlyMap[month].reports += 1
      monthlyMap[month].loss += parseFloat(r.financial_loss || 0)
    })
    const monthlyTrend = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6)

    return NextResponse.json({
      totalReports: reports.length,
      totalLoss,
      reportedThisWeek,
      averageLoss: reports.length > 0 ? Math.round(totalLoss / reports.length) : 0,
      topScamType: scamTypeBreakdown[0]?.type || 'N/A',
      resolvedCases: reports.filter((r: any) => r.status === 'verified').length,
      scamTypeBreakdown,
      platformBreakdown,
      ageBreakdown,
      monthlyTrend,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
