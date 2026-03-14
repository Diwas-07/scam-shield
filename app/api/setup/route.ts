import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scam_reports (
        id VARCHAR(36) PRIMARY KEY,
        scam_type VARCHAR(100) NOT NULL,
        platform VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        financial_loss DECIMAL(12, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'MYR',
        victim_age VARCHAR(20),
        reported_at DATETIME NOT NULL,
        severity VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        contact_method VARCHAR(100),
        evidence TEXT,
        region VARCHAR(100),
        anonymous TINYINT(1) DEFAULT 0
      )
    `)
    return NextResponse.json({ success: true, message: 'Table created or already exists' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Setup failed', details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const [rows]: any = await pool.query(`SHOW TABLES`)
    return NextResponse.json({ tables: rows.map((r: any) => Object.values(r)[0]) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list tables', details: String(error) }, { status: 500 })
  }
}
