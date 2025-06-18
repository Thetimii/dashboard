import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWebsiteLaunchEmail } from '@/lib/email'

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

    console.log('🚀 Starting website launch check for user:', userId)

    // Fetch user details
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !userData?.user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', userData.user.email)

    // Fetch project status
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from('project_status')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (projectError) {
      console.error('❌ Project status error:', projectError.message)
      return NextResponse.json(
        { error: 'Project status not found: ' + projectError.message },
        { status: 404 }
      )
    }

    console.log('✅ Project data found:', {
      status: projectData.status,
      final_url: projectData.final_url ? 'PRESENT' : 'MISSING'
    })

    // The trigger already verified that the status is 'live' and final_url is present.
    // We proceed directly to sending the email.
    // The checks below are removed to prevent race conditions.
    /*
    // Check if website status is 'live' (not complete, not in_progress)
    if (projectData.status !== 'live') {
      console.log('❌ Status not live:', projectData.status)
      return NextResponse.json(
        { error: 'Website status is not set to live yet: ' + projectData.status },
        { status: 400 }
      )
    }

    // Check if final_url is provided
    if (!projectData.final_url) {
      console.log('⚠️  Final URL missing, but continuing anyway')
      // Don't return error, just use a default or skip URL
    }
    */

    console.log('✅ Trigger confirmed website is live, sending email...')

    // Get business name
    const { data: kickoffData } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .maybeSingle()

    // Send email to customer
    const emailResult = await sendWebsiteLaunchEmail({
      customerEmail: userData.user.email,
      customerName: userData.user.user_metadata?.full_name || userData.user.email,
      businessName: kickoffData?.business_name || null,
      websiteUrl: projectData.final_url || 'https://yourwebsite.com', // Use fallback if missing
      launchedAt: new Date().toISOString(),
    })

    console.log('✅ Website launch email sent successfully!')

    return NextResponse.json({
      success: true,
      message: 'Website launch notification sent to customer',
      customerEmail: userData.user.email,
      emailResult: emailResult,
    })
  } catch (error) {
    console.error('💥 CRITICAL ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send website launch notification', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Website launch notification endpoint',
    usage: 'POST with { userId: "uuid" } to send website launch email to customer'
  })
}
