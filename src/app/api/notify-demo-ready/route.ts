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

    console.log('🔍 Starting demo ready check for user:', userId)

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

    // Fetch demo links with simple query
    const { data: demoData, error: demoError } = await supabaseAdmin
      .from('demo_links')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (demoError) {
      console.error('❌ Demo links error:', demoError.message)
      return NextResponse.json(
        { error: 'Demo links not found: ' + demoError.message },
        { status: 404 }
      )
    }

    console.log('✅ Demo data found:', {
      option1: demoData.option_1_url ? 'PRESENT' : 'MISSING',
      option2: demoData.option_2_url ? 'PRESENT' : 'MISSING', 
      option3: demoData.option_3_url ? 'PRESENT' : 'MISSING'
    })

    // Check if all 3 demo options are available
    const allDemosReady = demoData.option_1_url && demoData.option_2_url && demoData.option_3_url

    if (!allDemosReady) {
      console.log('❌ Not all demos ready')
      return NextResponse.json(
        { 
          error: 'Not all demo options are ready yet',
          demos: {
            option1: !!demoData.option_1_url,
            option2: !!demoData.option_2_url,
            option3: !!demoData.option_3_url
          }
        },
        { status: 400 }
      )
    }

    console.log('✅ All demos ready, sending email...')

    // Get business name
    const { data: kickoffData } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .maybeSingle()

    // Send email to customer
    const emailResult = await sendDemoReadyEmail({
      customerEmail: userData.user.email,
      customerName: userData.user.user_metadata?.full_name || userData.user.email,
      businessName: kickoffData?.business_name || null,
      option1Url: demoData.option_1_url,
      option2Url: demoData.option_2_url,
      option3Url: demoData.option_3_url,
    })

    console.log('✅ Email sent successfully!')

    return NextResponse.json({
      success: true,
      message: 'Demo ready notification sent to customer',
      customerEmail: userData.user.email,
      emailResult: emailResult,
    })
  } catch (error) {
    console.error('💥 CRITICAL ERROR:', error)
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
