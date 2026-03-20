import { NextRequest, NextResponse } from 'next/server'
import { dynamodb, TABLES, ScamReport } from '@/lib/dynamodb'
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { MOCK_REPORTS } from '@/lib/mockData'
import { v4 as uuidv4 } from 'uuid'
import { sendHighSeverityAlert } from '@/lib/sns'
import { analyzeReport } from '@/lib/lambda-api'

const USE_MOCK = !process.env.AWS_ACCESS_KEY_ID || process.env.USE_MOCK_DATA === 'true'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const page = parseInt(searchParams.get('page') || '1')
  const scamType = searchParams.get('type') ?? undefined

  try {
    if (USE_MOCK) {
      let reports = [...MOCK_REPORTS]
      if (scamType) reports = reports.filter(r => r.scamType === scamType)
      const total = reports.length
      const offset = (page - 1) * limit
      return NextResponse.json({ reports: reports.slice(offset, offset + limit), total, demo: true })
    }

    // Scan DynamoDB table
    const scanParams: any = {
      TableName: TABLES.SCAM_REPORTS,
    }

    if (scamType) {
      scanParams.FilterExpression = 'scamType = :scamType'
      scanParams.ExpressionAttributeValues = { ':scamType': scamType }
    }

    const result = await dynamodb.send(new ScanCommand(scanParams))
    let reports = (result.Items || []) as ScamReport[]

    // Sort by reportedAt descending
    reports.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())

    const total = reports.length
    const offset = (page - 1) * limit
    const paginatedReports = reports.slice(offset, offset + limit)

    return NextResponse.json({ reports: paginatedReports, total })
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
      imageUrls: body.imageUrls || [],
    }

    if (USE_MOCK) {
      console.log('[DEMO] Would write to DynamoDB:', report)
      return NextResponse.json({
        success: true, report,
        message: 'Report submitted (Demo Mode - DynamoDB not connected)',
        demo: true,
      })
    }

    await dynamodb.send(
      new PutCommand({
        TableName: TABLES.SCAM_REPORTS,
        Item: report,
      })
    )

    // Trigger async analysis via Lambda
    analyzeReport(report.id)
      .then(result => {
        console.log(`Report ${report.id} analyzed:`, result)
      })
      .catch(err => {
        console.error(`Failed to analyze report ${report.id}:`, err)
      })

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
