import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { sendDemoReadyEmail } from '@/lib/email'

const supabaseAdmin = createClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Manual demo ready email trigger called')
    
    const { userId, adminUserId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('📧 Processing manual demo ready email for user:', userId)

    // Check if email can be sent
    const { data: canSend, error: checkError } = await supabaseAdmin
      .rpc('can_send_demo_email', { target_user_id: userId })

    if (checkError) {
      console.error('❌ Error checking email eligibility:', checkError)
      return NextResponse.json(
        { error: 'Failed to check email eligibility: ' + checkError.message },
        { status: 500 }
      )
    }

    if (!canSend) {
      console.log('⚠️ Email cannot be sent - conditions not met')
      return NextResponse.json(
        { error: 'Email cannot be sent. Either demos are not ready or email was already sent for current demo URLs.' },
        { status: 400 }
      )
    }

    // Get user data
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !userData?.user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { error: 'User not found: ' + (userError?.message || 'Unknown error') },
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
        { error: 'Demo links not found: ' + (demoError?.message || 'No demo links found') },
        { status: 404 }
      )
    }

    console.log('✅ Demo data found:', {
      option1: demoData.option_1_url ? 'PRESENT' : 'MISSING',
      option2: demoData.option_2_url ? 'PRESENT' : 'MISSING', 
      option3: demoData.option_3_url ? 'PRESENT' : 'MISSING'
    })

    // Get business name
    const { data: kickoffData } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .single()

    // Send email to customer
    const emailResult = await sendDemoReadyEmail({
      customerEmail: userData.user.email,
      customerName: userData.user.user_metadata?.full_name || userData.user.email,
      businessName: kickoffData?.business_name || null,
      demoUrls: {
        option1: demoData.option_1_url,
        option2: demoData.option_2_url,
        option3: demoData.option_3_url,
      },
    })

    console.log('📧 Email send result:', emailResult)

    // Record the email send
    const { data: recordId, error: recordError } = await supabaseAdmin
      .rpc('record_email_send', {
        target_user_id: userId,
        email_type_param: 'demo_ready',
        admin_user_id: adminUserId
      })

    if (recordError) {
      console.error('⚠️ Failed to record email send:', recordError)
      // Don't fail the request, email was sent successfully
    }

    console.log('✅ Demo ready email sent successfully!')

    return NextResponse.json({
      success: true,
      message: 'Demo ready notification sent to customer',
      customerEmail: userData.user.email,
      emailResult: emailResult,
      recordId: recordId
    })

  } catch (error: any) {
    console.error('💥 CRITICAL ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send demo ready notification', 
        details: error.message || 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
