import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Admin client with service role for testing
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const emailType = searchParams.get('emailType')

  if (!userId || !emailType) {
    return NextResponse.json({ error: 'userId and emailType are required' }, { status: 400 })
  }

  try {
    // Test query for manual_email_sends
    console.log('🧪 Testing duplicate check for:', { userId, emailType })
    
    const { data: allEmails, error: allError } = await supabaseAdmin
      .from('manual_email_sends')
      .select('*')
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .order('sent_at', { ascending: false })

    console.log('🧪 All emails for user/type:', { allEmails, allError })

    const { data: lastEmail, error: lastError } = await supabaseAdmin
      .from('manual_email_sends')
      .select('trigger_values, sent_at, status')
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log('🧪 Last email query:', { lastEmail, lastError })

    // Get current trigger values for comparison
    let currentTriggerValues = null
    if (emailType === 'demo_ready') {
      const { data: demoData } = await supabaseAdmin
        .from('demo_links')
        .select('option_1_url, option_2_url, option_3_url, updated_at')
        .eq('user_id', userId)
        .single()
      currentTriggerValues = demoData
    } else if (emailType === 'website_launch') {
      const { data: statusData } = await supabaseAdmin
        .from('project_status')
        .select('final_url, status, updated_at')
        .eq('user_id', userId)
        .single()
      currentTriggerValues = statusData
    }

    let duplicateCheck = null
    if (lastEmail && currentTriggerValues) {
      const sortedLastValues = JSON.stringify(lastEmail.trigger_values, Object.keys(lastEmail.trigger_values).sort())
      const sortedCurrentValues = JSON.stringify(currentTriggerValues, Object.keys(currentTriggerValues).sort())
      
      duplicateCheck = {
        valuesChanged: sortedLastValues !== sortedCurrentValues,
        lastValues: lastEmail.trigger_values,
        currentValues: currentTriggerValues,
        sortedLastJSON: sortedLastValues,
        sortedCurrentJSON: sortedCurrentValues
      }
    }

    return NextResponse.json({
      userId,
      emailType,
      allEmailsCount: allEmails?.length || 0,
      allEmails,
      lastEmail,
      currentTriggerValues,
      duplicateCheck,
      errors: { allError, lastError }
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
