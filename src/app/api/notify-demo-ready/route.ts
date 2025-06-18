import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDemoReadyEmail } from '@/lib/email'

// Use service role for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Checking demo links for user:', userId)

    // Fetch user details
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !userData?.user) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch demo links
    const { data: demoData, error: demoError } = await supabaseAdmin
      .from('demo_links')
      .select('option_1_url, option_2_url, option_3_url')
      .eq('user_id', userId)
      .maybeSingle()

    if (demoError) {
      console.error('Error fetching demo links:', demoError)
      return NextResponse.json(
        { error: 'Database error fetching demo links' },
        { status: 500 }
      )
    }

    if (!demoData) {
      console.log('No demo links found for user:', userId)
      return NextResponse.json(
        { error: 'No demo links found for this user' },
        { status: 404 }
      )
    }

    // Check if all 3 demo options are available
    const allDemosReady = demoData.option_1_url && demoData.option_2_url && demoData.option_3_url

    if (!allDemosReady) {
      return NextResponse.json(
        { 
          error: 'Not all demo options are ready yet',
          readyCount: [demoData.option_1_url, demoData.option_2_url, demoData.option_3_url].filter(Boolean).length
        },
        { status: 400 }
      )
    }

    // Fetch business name from kickoff form
    let businessName = null
    const { data: kickoffData, error: kickoffError } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (!kickoffError && kickoffData) {
      businessName = kickoffData.business_name
    }

    // Get current domain for dashboard URL
    const dashboardUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/dashboard`
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/dashboard`
        : 'http://localhost:3000/dashboard'

    // Send email to customer
    const emailResult = await sendDemoReadyEmail({
      customerEmail: userData.user.email,
      customerName: userData.user.user_metadata?.full_name || userData.user.email,
      businessName: businessName,
      option1Url: demoData.option_1_url,
      option2Url: demoData.option_2_url,
      option3Url: demoData.option_3_url,
    })

    console.log('Demo ready email sent successfully to customer')

    return NextResponse.json({
      success: true,
      message: 'Demo ready notification sent to customer',
      customerEmail: userData.user.email,
      businessName: businessName,
      emailResult: emailResult,
    })
  } catch (error) {
    console.error('Error sending demo ready notification:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send demo ready notification', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Demo ready notification endpoint',
    usage: 'POST with { userId: "uuid" } to send demo ready email to customer'
  })
}
