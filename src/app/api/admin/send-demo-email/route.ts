import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDemoReadyEmail } from '@/lib/email'

// Use service role for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required as query parameter' },
        { status: 400 }
      )
    }

    // Just check demo status without sending email
    const { data: demoData, error: demoError } = await supabaseAdmin
      .from('demo_links')
      .select('option_1_url, option_2_url, option_3_url')
      .eq('user_id', userId)
      .single()

    if (demoError || !demoData) {
      return NextResponse.json({
        success: false,
        error: 'Demo links not found',
        userId
      })
    }

    const allDemosReady = demoData.option_1_url && demoData.option_2_url && demoData.option_3_url

    return NextResponse.json({
      success: true,
      message: 'Demo email API accessible via GET',
      userId,
      allDemosReady,
      demoUrls: {
        option1: !!demoData.option_1_url,
        option2: !!demoData.option_2_url,
        option3: !!demoData.option_3_url
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'API Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Manual demo ready email trigger called')
    
    // Add basic authentication check (you can enhance this later)
    const authHeader = request.headers.get('authorization')
    // For now, we'll skip auth check but log it
    if (authHeader) {
      console.log('Auth header present:', authHeader?.substring(0, 20) + '...')
    } else {
      console.log('⚠️ No auth header - proceeding without auth check')
    }
    
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      console.log('❌ Missing userId in request body')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('📧 Processing demo ready email for user:', userId)

    // Test Supabase connection first
    try {
      const { data: testData, error: testError } = await supabaseAdmin
        .from('demo_links')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError)
        return NextResponse.json(
          { error: 'Database connection failed', details: testError.message },
          { status: 500 }
        )
      }
      console.log('✅ Supabase connection test passed')
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown' },
        { status: 500 }
      )
    }

    // Get user data
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !userData?.user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { status: 404 }
      )
    }

    console.log('✅ User found:', userData.user.email)

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

    // Check for duplicate sends - only send if data has changed
    console.log('🔄 Checking for previous email sends...')
    const { data: lastEmailSend } = await supabaseAdmin
      .from('manual_email_sends')
      .select('trigger_values, sent_at')
      .eq('user_id', userId)
      .eq('email_type', 'demo_ready')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single()

    if (lastEmailSend) {
      const lastValues = lastEmailSend.trigger_values
      const currentValues = {
        option_1_url: demoData.option_1_url,
        option_2_url: demoData.option_2_url,
        option_3_url: demoData.option_3_url
      }

      const hasChanged = (
        lastValues?.option_1_url !== currentValues.option_1_url ||
        lastValues?.option_2_url !== currentValues.option_2_url ||
        lastValues?.option_3_url !== currentValues.option_3_url
      )

      if (!hasChanged) {
        console.log('⏸️ Email not sent - demo URLs unchanged since last send')
        return NextResponse.json({
          success: false,
          message: 'Email not sent - demo URLs have not changed since last send',
          lastSent: lastEmailSend.sent_at,
          reason: 'No changes detected'
        }, { status: 400 })
      }

      console.log('✅ Demo URLs have changed since last send, proceeding...')
    } else {
      console.log('✅ No previous email found, proceeding with first send...')
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

    // Record the email send in tracking table to prevent duplicates
    try {
      const { error: trackingError } = await supabaseAdmin
        .from('manual_email_sends')
        .insert({
          user_id: userId,
          email_type: 'demo_ready',
          sent_by: null, // Could be enhanced to track admin user
          trigger_values: {
            option_1_url: demoData.option_1_url,
            option_2_url: demoData.option_2_url,
            option_3_url: demoData.option_3_url
          }
        })
      
      if (trackingError) {
        console.warn('⚠️ Failed to record email send for tracking:', trackingError)
        // Don't fail the request, just log the warning
      } else {
        console.log('✅ Email send recorded for duplicate prevention')
      }
    } catch (trackingError) {
      console.warn('⚠️ Error recording email send:', trackingError)
    }

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
