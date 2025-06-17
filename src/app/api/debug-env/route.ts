import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyFirst4: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 4) + '...' : 'Not set',
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    adminEmail: process.env.ADMIN_EMAIL,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
