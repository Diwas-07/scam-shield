import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendNotification } from '@/lib/lambda-api';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId, email, notificationType } = await request.json();

    if (!reportId || !email || !notificationType) {
      return NextResponse.json(
        { error: 'reportId, email, and notificationType are required' },
        { status: 400 }
      );
    }

    // Call Lambda function via API Gateway
    const result = await sendNotification(reportId, email, notificationType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calling Lambda:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
