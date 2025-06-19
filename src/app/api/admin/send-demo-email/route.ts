import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { sendDemoReadyEmail } from '@/lib/email'

const supabaseAdmin = createClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Manual demo ready email trigger called')
    
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('📧 Processing demo ready email for user:', userId)

    // Get user data
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !userData?.user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get demo data
    const { data: demoData, error: demoError } = await supabaseAdmin
      .from('demo_links')
      .select('option_1_url, option_2_url, option_3_url')
      .eq('user_id', userId)
      .single()

    if (demoError || !demoData) {
      console.error('❌ Demo links not found:', demoError)
      return NextResponse.json(
        { error: 'Demo links not found' },
        { status: 404 }
      )
    }

    // Check if all demos are ready
    const allDemosReady = demoData.option_1_url && demoData.option_2_url && demoData.option_3_url

    if (!allDemosReady) {
      return NextResponse.json(
        { error: 'Not all demo URLs are ready' },
        { status: 400 }
      )
    }

    // Get business name
    const { data: kickoffData } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .single()

    // Send email directly with the three URLs
    const emailResult = await sendDemoReadyEmail({
      customerEmail: userData.user.email,
      customerName: userData.user.user_metadata?.full_name || userData.user.email,
      businessName: kickoffData?.business_name || null,
      option1Url: demoData.option_1_url,
      option2Url: demoData.option_2_url,
      option3Url: demoData.option_3_url,
    })

    // Simple log
    console.log(`✅ Demo email sent to ${userData.user.email} for ${kickoffData?.business_name || 'project'}`)

    return NextResponse.json({
      success: true,
      message: 'Demo ready email sent',
      customerEmail: userData.user.email
    })

  } catch (error: any) {
    console.error('💥 Error sending demo email:', error)
    return NextResponse.json(
      { error: 'Failed to send demo email' },
      { status: 500 }
    )
  }
}
