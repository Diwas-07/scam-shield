import { NextRequest, NextResponse } from 'next/server'
import pool, { ScamReport } from '@/lib/db'
import { MOCK_REPORTS } from '@/lib/mockData'
import { v4 as uuidv4 } from 'uuid'

const USE_MOCK = !process.env.RDS_HOST || process.env.USE_MOCK_DATA === 'true'

export async function fetchReports({ limit = 20, scamType }: { limit?: number; scamType?: string } = {}) {
  if (USE_MOCK) {
    let reports = [...MOCK_REPORTS]
    if (scamType) reports = reports.filter(r => r.scamType === scamType)
    return { reports: reports.slice(0, limit), total: reports.length, demo: true }
  }

  let query = `SELECT * FROM scam_reports`
  const params: any[] = []
  if (scamType) {
    query += ` WHERE scam_type = ?`
    params.push(scamType)
  }
  query += ` ORDER BY reported_at DESC LIMIT ?`
  params.push(limit)

  const [rows]: any = await pool.query(query, params)
  const reports = rows.map((r: any) => ({
    id: r.id,
    scamType: r.scam_type,
    platform: r.platform,
    description: r.description,
    financialLoss: parseFloat(r.financial_loss || 0),
    currency: r.currency,
    victimAge: r.victim_age,
    reportedAt: r.reported_at instanceof Date ? r.reported_at.toISOString() : String(r.reported_at),
    severity: r.severity,
    status: r.status,
    contactMethod: r.contact_method,
    evidence: r.evidence,
    region: r.region,
    anonymous: !!r.anonymous,
  }))
  return { reports, total: reports.length }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const scamType = searchParams.get('type') ?? undefined

  try {
    const result = await fetchReports({ limit, scamType })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const report: ScamReport = {
      id: uuidv4(),
      scamType: body.scamType,
      platform: body.platform,
      description: body.description,
      financialLoss: parseFloat(body.financialLoss) || 0,
      currency: body.currency || 'MYR',
      victimAge: body.victimAge,
      reportedAt: new Date().toISOString(),
      severity: body.financialLoss > 10000 ? 'high' : body.financialLoss > 1000 ? 'medium' : 'low',
      status: 'pending',
      contactMethod: body.contactMethod,
      evidence: body.evidence,
      region: body.region,
      anonymous: body.anonymous || false,
    }

    if (USE_MOCK) {
      console.log('[DEMO] Would write to RDS:', report)
      return NextResponse.json({
        success: true, report,
        message: 'Report submitted (Demo Mode - RDS not connected)',
        demo: true,
      })
    }

    await pool.query(
      `INSERT INTO scam_reports
        (id, scam_type, platform, description, financial_loss, currency, victim_age,
         reported_at, severity, status, contact_method, evidence, region, anonymous)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        report.id, report.scamType, report.platform, report.description,
        report.financialLoss, report.currency, report.victimAge ?? null,
        report.reportedAt, report.severity, report.status,
        report.contactMethod ?? null, report.evidence ?? null,
        report.region ?? null, report.anonymous ? 1 : 0,
      ]
    )

    return NextResponse.json({ success: true, report, message: 'Report saved to database' })
  } catch (error) {
    console.error('Error submitting report:', error)
    return NextResponse.json({ error: 'Failed to submit report', details: String(error) }, { status: 500 })
  }
}
