import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'API routes working',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/admin/send-demo-email',
      '/api/admin/send-launch-email'
    ]
  })
}

export async function POST() {
  return NextResponse.json({ 
    status: 'POST request received',
    message: 'Admin API routes are working'
  })
}
