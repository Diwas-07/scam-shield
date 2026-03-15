import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - List all reports for moderation
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)))
    const offset = (page - 1) * limit

    // Get total count
    const countRows = await query('SELECT COUNT(*) as total FROM scam_reports')
    const total = (countRows as any[])[0]?.total || 0

    // Get paginated reports - use string interpolation for LIMIT/OFFSET as they're safe integers
    const reports = await query(
      `SELECT * FROM scam_reports ORDER BY reported_at DESC LIMIT ${limit} OFFSET ${offset}`
    )

    // Transform to camelCase for frontend
    const transformedReports = (reports as any[]).map((r: any) => ({
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

    return NextResponse.json({ reports: transformedReports, total, page, limit })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update report status
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { reportId, status } = await request.json()

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validStatuses = ['pending', 'verified', 'investigating', 'resolved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await query('UPDATE scam_reports SET status = ? WHERE id = ?', [status, reportId])

    return NextResponse.json({ message: 'Report status updated' })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// DELETE - Delete report
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json({ error: 'Missing reportId' }, { status: 400 })
    }

    await query('DELETE FROM scam_reports WHERE id = ?', [reportId])

    return NextResponse.json({ message: 'Report deleted' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
