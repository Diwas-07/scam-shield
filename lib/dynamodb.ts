import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
})

// Table names
export const TABLES = {
  REPORTS: process.env.DYNAMODB_REPORTS_TABLE || 'scamshield-reports',
  STATS: process.env.DYNAMODB_STATS_TABLE || 'scamshield-stats',
} as const

// Scam types
export const SCAM_TYPES = [
  'Phishing Email',
  'Fake Job Offer',
  'Romance Scam',
  'Investment Fraud',
  'Online Shopping Fraud',
  'Tech Support Scam',
  'Social Media Impersonation',
  'Lottery/Prize Scam',
  'Advance Fee Fraud',
  'Cryptocurrency Scam',
  'SMS/WhatsApp Scam',
  'Other',
] as const

export type ScamType = typeof SCAM_TYPES[number]

export interface ScamReport {
  id: string
  scamType: ScamType
  platform: string
  description: string
  financialLoss: number
  currency: string
  victimAge?: string
  reportedAt: string
  severity: 'low' | 'medium' | 'high'
  status: 'pending' | 'verified' | 'investigating'
  contactMethod?: string
  evidence?: string
  region?: string
  anonymous: boolean
}
