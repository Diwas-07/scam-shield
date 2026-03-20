// API client for Lambda functions via API Gateway

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL || '';

interface AnalyzeReportResponse {
  reportId: string;
  severity: string;
  riskScore: number;
  message: string;
}

interface SendNotificationResponse {
  message: string;
  messageId: string;
}

export async function analyzeReport(reportId: string): Promise<AnalyzeReportResponse> {
  const response = await fetch(`${API_GATEWAY_URL}/analyze-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze report');
  }

  return response.json();
}

export async function sendNotification(
  reportId: string,
  email: string,
  notificationType: 'submitted' | 'verified' | 'resolved'
): Promise<SendNotificationResponse> {
  const response = await fetch(`${API_GATEWAY_URL}/send-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportId, email, notificationType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send notification');
  }

  return response.json();
}

export async function processImageLambda(imageKey: string) {
  const response = await fetch(`${API_GATEWAY_URL}/process-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process image');
  }

  return response.json();
}
