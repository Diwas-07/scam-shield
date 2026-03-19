import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dynamodb, TABLES } from '@/lib/dynamodb'
import { ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'

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

    const result = await dynamodb.send(
      new ScanCommand({
        TableName: TABLES.SCAM_REPORTS,
      })
    )

    const allReports = result.Items || []
    
    // Sort by reportedAt descending
    const sortedReports = allReports.sort((a: any, b: any) => 
      new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    )

    const total = sortedReports.length
    const reports = sortedReports.slice(offset, offset + limit)

    return NextResponse.json({ reports, total, page, limit })
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

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLES.SCAM_REPORTS,
        Key: { id: reportId },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
      })
    )

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

    await dynamodb.send(
      new DeleteCommand({
        TableName: TABLES.SCAM_REPORTS,
        Key: { id: reportId },
      })
    )

    return NextResponse.json({ message: 'Report deleted' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
