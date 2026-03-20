import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { dynamodb, TABLES } from '@/lib/dynamodb'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: TABLES.USERS,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      })
    )

    if (result.Items && result.Items.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    await dynamodb.send(
      new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          id: uuidv4(),
          name,
          email,
          passwordHash,
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      })
    )

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
