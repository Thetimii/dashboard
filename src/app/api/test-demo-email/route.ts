// Test API endpoint for demo approval email
import { NextRequest, NextResponse } from 'next/server'
import { sendDemoApprovalEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing demo approval email...')
    
    const testData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      businessName: 'Acme Corporation',
      approvedOption: '2',
      demoUrl: 'https://example.com/demo-2',
      approvedAt: new Date().toISOString()
    }

    const result = await sendDemoApprovalEmail(testData)
    
    return NextResponse.json({
      success: true,
      message: 'Demo approval email sent successfully',
      result
    })
  } catch (error) {
    console.error('Test demo approval email failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
