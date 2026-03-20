import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ 
    message: 'DynamoDB tables should be created manually via AWS Console or Terraform',
    note: 'Tables needed: users (with email-index GSI) and scam_reports'
  })
}

export async function GET() {
  return NextResponse.json({ 
    tables: ['users', 'scam_reports'],
    note: 'Using DynamoDB - tables managed via AWS Console or IaC'
  })
}
