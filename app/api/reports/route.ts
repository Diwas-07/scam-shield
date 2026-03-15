import { NextRequest, NextResponse } from 'next/server'
import pool, { ScamReport } from '@/lib/db'
import { MOCK_REPORTS } from '@/lib/mockData'
import { v4 as uuidv4 } from 'uuid'
import { sendHighSeverityAlert } from '@/lib/sns'

const USE_MOCK = !process.env.RDS_HOST || process.env.USE_MOCK_DATA === 'true'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * limit
  const scamType = searchParams.get('type') ?? undefined

  try {
    if (USE_MOCK) {
      let reports = [...MOCK_REPORTS]
      if (scamType) reports = reports.filter(r => r.scamType === scamType)
      const total = reports.length
      return NextResponse.json({ reports: reports.slice(offset, offset + limit), total, demo: true })
    }

    const countParams: any[] = []
    let countQuery = `SELECT COUNT(*) as total FROM scam_reports`
    if (scamType) {
      countQuery += ` WHERE scam_type = ?`
      countParams.push(scamType)
    }

    let query = `SELECT * FROM scam_reports`
    const params: any[] = []
    if (scamType) {
      query += ` WHERE scam_type = ?`
      params.push(scamType)
    }
    query += ` ORDER BY reported_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [[{ total }]]: any = await pool.query(countQuery, countParams)
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

    return NextResponse.json({ reports, total })
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

    // Send SNS alert for high-severity reports
    if (report.severity === 'high') {
      await sendHighSeverityAlert({
        reportId: report.id,
        scamType: report.scamType,
        platform: report.platform,
        financialLoss: report.financialLoss,
        currency: report.currency,
        severity: report.severity,
        region: report.region,
        description: report.description,
      })
    }

    return NextResponse.json({ success: true, report, message: 'Report saved to database' })
  } catch (error) {
    console.error('Error submitting report:', error)
    return NextResponse.json({ error: 'Failed to submit report', details: String(error) }, { status: 500 })
  }
}
