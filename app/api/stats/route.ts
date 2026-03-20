import { NextResponse } from 'next/server'
import { dynamodb, TABLES } from '@/lib/dynamodb'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { MOCK_STATS } from '@/lib/mockData'

const USE_MOCK = !process.env.AWS_ACCESS_KEY_ID || process.env.USE_MOCK_DATA === 'true'

export async function GET() {
  if (USE_MOCK) {
    return NextResponse.json({ ...MOCK_STATS, demo: true })
  }

  try {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: TABLES.SCAM_REPORTS,
      })
    )

    const reports = result.Items || []

    const totalLoss = reports.reduce((sum: number, r: any) => sum + (r.financialLoss || 0), 0)

    const scamTypeCounts: Record<string, number> = {}
    reports.forEach((r: any) => {
      scamTypeCounts[r.scamType] = (scamTypeCounts[r.scamType] || 0) + 1
    })

    const scamTypeBreakdown = Object.entries(scamTypeCounts)
      .map(([type, count]) => ({
        type, count,
        percentage: Math.round((count / reports.length) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const reportedThisWeek = reports.filter((r: any) => new Date(r.reportedAt) >= oneWeekAgo).length

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
      const group = r.victimAge || 'Unknown'
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
      const month = new Date(r.reportedAt).toLocaleString('en-US', { month: 'short', year: '2-digit' })
      if (!monthlyMap[month]) monthlyMap[month] = { reports: 0, loss: 0 }
      monthlyMap[month].reports += 1
      monthlyMap[month].loss += (r.financialLoss || 0)
    })
    const monthlyTrend = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6)

    // Weekly pattern — group by day of week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayCounts: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }
    reports.forEach((r: any) => {
      const day = days[new Date(r.reportedAt).getDay()]
      dayCounts[day] += 1
    })
    const weeklyPattern = days.map(day => ({ day, reports: dayCounts[day] }))

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
      weeklyPattern,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
