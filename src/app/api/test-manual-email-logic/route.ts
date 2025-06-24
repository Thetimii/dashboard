import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Admin client for testing
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Fixed user and email type for testing
    const userId = 'c9e857ca-c99b-4f15-b5de-a0fffb4e5f16'
    const emailType = 'demo_ready'
    const adminId = '28e36a09-3cda-4024-a49d-d5fd2c877a6a'

    console.log('🧪 Testing duplicate logic with:', { userId, emailType, adminId })

    // Get current demo data
    const { data: demoData } = await supabaseAdmin
      .from('demo_links')
      .select('option_1_url, option_2_url, option_3_url, updated_at')
      .eq('user_id', userId)
      .single()

    console.log('📊 Current demo data:', demoData)

    // Get last email sent
    const { data: lastEmail } = await supabaseAdmin
      .from('manual_email_sends')
      .select('trigger_values, sent_at')
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log('📧 Last email found:', lastEmail)

    let duplicateCheck = null
    if (lastEmail && demoData) {
      // Same logic as in the main API
      const lastValuesString = JSON.stringify(lastEmail.trigger_values)
      const currentValuesString = JSON.stringify(demoData)
      
      const sortedLastValues = JSON.stringify(lastEmail.trigger_values, Object.keys(lastEmail.trigger_values || {}).sort())
      const sortedCurrentValues = JSON.stringify(demoData, Object.keys(demoData || {}).sort())
      
      const rawComparison = lastValuesString === currentValuesString
      const sortedComparison = sortedLastValues === sortedCurrentValues
      const deepEqual = JSON.stringify(lastEmail.trigger_values) === JSON.stringify(demoData)
      
      const valuesChanged = !rawComparison && !sortedComparison && !deepEqual
      const shouldBlock = !valuesChanged || rawComparison || sortedComparison || deepEqual

      duplicateCheck = {
        lastValuesString,
        currentValuesString,
        sortedLastValues,
        sortedCurrentValues,
        rawComparison,
        sortedComparison,
        deepEqual,
        valuesChanged,
        shouldBlock,
        verdict: shouldBlock ? 'BLOCK DUPLICATE' : 'ALLOW SEND'
      }
    }

    return NextResponse.json({
      testInfo: {
        userId,
        emailType,
        adminId,
        testUrl: '/api/test-manual-email-logic'
      },
      currentDemoData: demoData,
      lastEmail: lastEmail ? {
        sentAt: lastEmail.sent_at,
        triggerValues: lastEmail.trigger_values
      } : null,
      duplicateCheck,
      conclusion: duplicateCheck?.shouldBlock ? 
        '❌ WOULD BLOCK - Email is duplicate' : 
        '✅ WOULD ALLOW - Values have changed or no previous email'
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
