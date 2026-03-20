import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN }),
  },
})

export const dynamodb = DynamoDBDocumentClient.from(client)

export const TABLES = {
  USERS: 'users',
  SCAM_REPORTS: 'scam_reports',
}

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
  imageUrls?: string[]
}

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: string
  createdAt: string
}
