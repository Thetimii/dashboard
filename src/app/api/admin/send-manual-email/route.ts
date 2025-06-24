import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendDemoReadyEmail, sendWebsiteLaunchEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, emailType, sentBy } = await request.json()

    if (!userId || !emailType || !sentBy) {
      return NextResponse.json(
        { error: 'userId, emailType, and sentBy are required' },
        { status: 400 }
      )
    }

    // Verify admin permissions
    const { data: adminUser } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', sentBy)
      .single()

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    // Get current state for trigger values and validate email can be sent
    let triggerValues = null
    let emailSubject = ''
    let canSend = false
    
    if (emailType === 'demo_ready') {
      const { data: demoData } = await supabase
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
      const { data: statusData } = await supabase
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
    const { data: lastEmail } = await supabase
      .from('manual_email_sends')
      .select('trigger_values, sent_at')
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single()

    if (lastEmail) {
      const valuesChanged = JSON.stringify(lastEmail.trigger_values) !== JSON.stringify(triggerValues)
      if (!valuesChanged) {
        return NextResponse.json({ 
          error: `Email already sent with same content on ${new Date(lastEmail.sent_at).toLocaleDateString()}. Values have not changed.`,
          lastSent: lastEmail.sent_at,
          duplicate: true
        }, { status: 400 })
      }
    }

    // Get business name for email
    const { data: kickoffData } = await supabase
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .maybeSingle()

    // Send the actual email
    let emailResult
    if (emailType === 'demo_ready') {
      emailResult = await sendDemoReadyEmail({
        customerEmail: userData.user.email!,
        customerName: userProfile?.full_name || userData.user.email!,
        businessName: kickoffData?.business_name || null,
        option1Url: triggerValues.option_1_url,
        option2Url: triggerValues.option_2_url,
        option3Url: triggerValues.option_3_url,
      })
    } else if (emailType === 'website_launch') {
      emailResult = await sendWebsiteLaunchEmail({
        customerEmail: userData.user.email!,
        customerName: userProfile?.full_name || userData.user.email!,
        businessName: kickoffData?.business_name || null,
        websiteUrl: triggerValues.final_url,
        launchedAt: new Date().toISOString(),
      })
    }

    // Record the email send
    const { error: insertError } = await supabase
      .from('manual_email_sends')
      .insert({
        user_id: userId,
        email_type: emailType,
        sent_by: sentBy,
        trigger_values: triggerValues,
        email_subject: emailSubject,
        email_recipient: userData.user.email!,
        status: 'sent'
      })

    if (insertError) {
      console.error('Failed to record email send:', insertError)
      return NextResponse.json({ error: 'Failed to record email send' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `${emailType} email sent successfully`,
      recipient: userData.user.email,
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
      .single()

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
