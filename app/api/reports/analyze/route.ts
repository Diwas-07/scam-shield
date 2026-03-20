import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeReport } from '@/lib/lambda-api';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 });
    }

    // Call Lambda function via API Gateway
    const result = await analyzeReport(reportId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calling Lambda:', error);
    return NextResponse.json(
      { error: 'Failed to analyze report' },
      { status: 500 }
    );
  }
}
