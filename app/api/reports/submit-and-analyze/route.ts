import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportData = await request.json();

    // 1. Save report to database (your existing logic)
    // const newReport = await saveReportToDatabase(reportData);
    const reportId = 'newly-created-report-id'; // Replace with actual ID

    // 2. Trigger async analysis via Lambda (fire and forget)
    fetch(`${process.env.NEXTAUTH_URL}/api/reports/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId }),
    }).catch(err => console.error('Analysis failed:', err));

    // 3. Send notification to user
    fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId,
        email: session.user?.email,
        notificationType: 'submitted',
      }),
    }).catch(err => console.error('Notification failed:', err));

    return NextResponse.json({
      id: reportId,
      status: 'submitted',
      message: 'Report submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
