import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.RDS_HOST,
  port: parseInt(process.env.RDS_PORT || '3306'),
  database: process.env.RDS_DATABASE || 'scamshield',
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
})

export default pool

// Query helper function
export async function query(sql: string, params?: any[]) {
  const [rows] = await pool.execute(sql, params || [])
  return rows
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
}
