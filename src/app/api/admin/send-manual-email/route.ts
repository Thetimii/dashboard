import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendDemoReadyEmail, sendWebsiteLaunchEmail } from '@/lib/email'

// Admin client with service role for auth operations
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Received manual email request')
    
    const supabase = await createClient()
    
    // Parse request body with error handling
    let body
    try {
      body = await request.json()
      console.log('📧 Manual email request body:', body)
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    const { userId, emailType, sentBy } = body

    console.log('📧 Extracted parameters:', { userId, emailType, sentBy })

    if (!userId || !emailType || !sentBy) {
      console.log('❌ Missing parameters:', { userId, emailType, sentBy })
      return NextResponse.json(
        { error: 'userId, emailType, and sentBy are required' },
        { status: 400 }
      )
    }

    // Verify admin permissions
    const { data: adminUser, error: adminError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', sentBy)
      .single()

    console.log('🔑 Admin check result:', { adminUser, adminError })

    if (adminError || adminUser?.role !== 'admin') {
      console.log('❌ Admin check failed:', { adminError, role: adminUser?.role })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get user data from user_profiles and auth using admin client
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    console.log('👤 User profile result:', { userProfile, userProfileError })

    if (userProfileError || !userProfile) {
      console.log('❌ User profile not found:', { userProfileError, userId })
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get user email using admin client
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    console.log('📧 User data result:', { 
      hasUser: !!userData?.user, 
      email: userData?.user?.email, 
      error: userError 
    })

    if (userError || !userData?.user?.email) {
      console.log('❌ User email not found:', { userError, userId })
      return NextResponse.json({ error: 'User email not found' }, { status: 404 })
    }

    const userEmail = userData.user.email
    const userName = userProfile.full_name || userEmail

    // Get current state for trigger values and validate email can be sent
    let triggerValues = null
    let emailSubject = ''
    let canSend = false
    
    if (emailType === 'demo_ready') {
      const { data: demoData } = await supabaseAdmin
        .from('demo_links')
        .select('option_1_url, option_2_url, option_3_url, updated_at')
        .eq('user_id', userId)
        .single()
      
      if (!demoData) {
        return NextResponse.json({ error: 'No demo links found' }, { status: 400 })
      }

      // Check if all 3 demo options are present
      canSend = !!(demoData.option_1_url && demoData.option_2_url && demoData.option_3_url)
      if (!canSend) {
        return NextResponse.json({ 
          error: 'All 3 demo options must be present to send demo ready email',
          currentState: {
            option1: !!demoData.option_1_url,
            option2: !!demoData.option_2_url,
            option3: !!demoData.option_3_url
          }
        }, { status: 400 })
      }
      
      triggerValues = demoData
      emailSubject = 'Your Website Demos Are Ready!'
      
    } else if (emailType === 'website_launch') {
      const { data: statusData } = await supabaseAdmin
        .from('project_status')
        .select('final_url, status, updated_at')
        .eq('user_id', userId)
        .single()
      
      if (!statusData) {
        return NextResponse.json({ error: 'No project status found' }, { status: 400 })
      }

      // Check if website is live and has final URL
      canSend = !!(statusData.status === 'live' && statusData.final_url)
      if (!canSend) {
        return NextResponse.json({ 
          error: 'Website must be live with a final URL to send launch email',
          currentState: {
            status: statusData.status,
            hasFinalUrl: !!statusData.final_url
          }
        }, { status: 400 })
      }
      
      triggerValues = statusData
      emailSubject = 'Your Website Is Now Live!'
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    // Check for duplicates - compare current state with last email sent
    const { data: lastEmail } = await supabaseAdmin
      .from('manual_email_sends')
      .select('trigger_values, sent_at')
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastEmail) {
      console.log('📧 Found last email:', {
        sentAt: lastEmail.sent_at,
        lastTriggerValues: lastEmail.trigger_values,
        currentTriggerValues: triggerValues
      })
      
      const valuesChanged = JSON.stringify(lastEmail.trigger_values) !== JSON.stringify(triggerValues)
      console.log('📧 Values comparison:', {
        valuesChanged,
        lastJSON: JSON.stringify(lastEmail.trigger_values),
        currentJSON: JSON.stringify(triggerValues)
      })
      
      if (!valuesChanged) {
        console.log('❌ Duplicate detected - values have not changed')
        return NextResponse.json({ 
          error: `Email already sent with same content on ${new Date(lastEmail.sent_at).toLocaleDateString()}. Values have not changed.`,
          lastSent: lastEmail.sent_at,
          duplicate: true
        }, { status: 400 })
      }
      
      console.log('✅ Values have changed, email can be sent')
    } else {
      console.log('📧 No previous email found, can send')
    }

    // Get business name for email
    const { data: kickoffData } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .maybeSingle()

    // Send the actual email
    let emailResult
    if (emailType === 'demo_ready') {
      const demoValues = triggerValues as any
      emailResult = await sendDemoReadyEmail({
        customerEmail: userEmail,
        customerName: userName,
        businessName: kickoffData?.business_name || null,
        option1Url: demoValues.option_1_url,
        option2Url: demoValues.option_2_url,
        option3Url: demoValues.option_3_url,
      })
    } else if (emailType === 'website_launch') {
      const statusValues = triggerValues as any
      emailResult = await sendWebsiteLaunchEmail({
        customerEmail: userEmail,
        customerName: userName,
        businessName: kickoffData?.business_name || null,
        websiteUrl: statusValues.final_url,
        launchedAt: new Date().toISOString(),
      })
    }

    // Record the email send
    const { error: insertError } = await supabaseAdmin
      .from('manual_email_sends')
      .insert({
        user_id: userId,
        email_type: emailType,
        sent_by: sentBy,
        trigger_values: triggerValues,
        email_subject: emailSubject,
        email_recipient: userEmail,
        status: 'sent'
      })

    if (insertError) {
      console.error('Failed to record email send:', insertError)
      return NextResponse.json({ error: 'Failed to record email send' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `${emailType} email sent successfully`,
      recipient: userEmail,
      emailResult 
    })

  } catch (error) {
    console.error('Manual email send error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const emailType = searchParams.get('emailType')

  if (!userId || !emailType) {
    return NextResponse.json({ error: 'userId and emailType are required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    
    // Check current state and duplicate status
    let currentState = null
    let canSend = false
    
    if (emailType === 'demo_ready') {
      const { data: demoData } = await supabase
        .from('demo_links')
        .select('option_1_url, option_2_url, option_3_url, updated_at')
        .eq('user_id', userId)
        .single()
      
      if (demoData) {
        currentState = demoData
        canSend = !!(demoData.option_1_url && demoData.option_2_url && demoData.option_3_url)
      }
    } else if (emailType === 'website_launch') {
      const { data: statusData } = await supabase
        .from('project_status')
        .select('final_url, status, updated_at')
        .eq('user_id', userId)
        .single()
      
      if (statusData) {
        currentState = statusData
        canSend = !!(statusData.status === 'live' && statusData.final_url)
      }
    }

    if (!currentState) {
      return NextResponse.json({
        canSend: false,
        reason: 'No data available for this email type',
        currentState: null,
        lastEmail: null
      })
    }

    // Check last email sent
    const { data: lastEmail } = await supabase
      .from('manual_email_sends')
      .select('trigger_values, sent_at, email_subject')
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let duplicateStatus = 'no_previous_email'
    if (lastEmail) {
      const valuesChanged = JSON.stringify(lastEmail.trigger_values) !== JSON.stringify(currentState)
      duplicateStatus = valuesChanged ? 'values_changed' : 'duplicate'
      if (!valuesChanged) {
        canSend = false
      }
    }

    return NextResponse.json({
      canSend,
      reason: canSend ? 'Ready to send' : (
        duplicateStatus === 'duplicate' 
          ? `Same values as last email sent on ${new Date(lastEmail?.sent_at || '').toLocaleDateString()}`
          : emailType === 'demo_ready' 
            ? 'All 3 demo options must be present'
            : 'Website must be live with final URL'
      ),
      currentState,
      lastEmail: lastEmail ? {
        sentAt: lastEmail.sent_at,
        subject: lastEmail.email_subject,
        triggerValues: lastEmail.trigger_values
      } : null,
      duplicateStatus
    })

  } catch (error) {
    console.error('Error checking email status:', error)
    return NextResponse.json({ error: 'Failed to check email status' }, { status: 500 })
  }
}
