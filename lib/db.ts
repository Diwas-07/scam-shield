import mysql from 'mysql2/promise'
import type { ScamType } from '@/lib/constants'

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

export type { ScamType }

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
