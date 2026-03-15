import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN, // Required for AWS Academy temporary credentials
      }
    : undefined,
})

interface HighSeverityReportAlert {
  reportId: string
  scamType: string
  platform: string
  financialLoss: number
  currency: string
  severity: string
  region?: string
  description?: string
}

export async function sendHighSeverityAlert(report: HighSeverityReportAlert) {
  const topicArn = process.env.SNS_TOPIC_ARN

  if (!topicArn) {
    console.warn('SNS_TOPIC_ARN not configured. Skipping notification.')
    return { success: false, message: 'SNS not configured' }
  }

  try {
    const message = `
🚨 HIGH SEVERITY SCAM REPORT ALERT 🚨

Report ID: ${report.reportId}
Scam Type: ${report.scamType}
Platform: ${report.platform}
Financial Loss: ${report.currency} ${report.financialLoss.toLocaleString()}
Severity: ${report.severity.toUpperCase()}
${report.region ? `Region: ${report.region}` : ''}

Description: ${report.description?.substring(0, 200) || 'No description provided'}${report.description && report.description.length > 200 ? '...' : ''}

⚠️ Immediate admin review required.
View report: ${process.env.NEXTAUTH_URL}/admin
    `.trim()

    const command = new PublishCommand({
      TopicArn: topicArn,
      Subject: `High Severity Scam Alert - ${report.scamType}`,
      Message: message,
    })

    const response = await snsClient.send(command)

    console.log('SNS notification sent successfully:', response.MessageId)
    return { success: true, messageId: response.MessageId }
  } catch (error) {
    console.error('Failed to send SNS notification:', error)
    return { success: false, error: String(error) }
  }
}
