import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWebsiteLaunchEmail } from '@/lib/email'

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

    // Just check project status without sending email
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('status, website_url')
      .eq('user_id', userId)
      .single()

    if (projectError || !projectData) {
      return NextResponse.json({
        success: false,
        error: 'Project not found',
        userId
      })
    }

    const isLive = projectData.status === 'live'

    return NextResponse.json({
      success: true,
      message: 'Launch email API accessible via GET',
      userId,
      isLive,
      status: projectData.status,
      hasWebsiteUrl: !!projectData.website_url
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
    console.log('🎯 Manual website launch email trigger called')
    
    // Add basic authentication check
    const authHeader = request.headers.get('authorization')
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

    console.log('🚀 Processing website launch email for user:', userId)

    // Test Supabase connection first
    try {
      const { data: testData, error: testError } = await supabaseAdmin
        .from('project_status')
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
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get project data
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from('project_status')
      .select('status, final_url')
      .eq('user_id', userId)
      .single()

    if (projectError || !projectData) {
      console.error('❌ Project status not found:', projectError)
      return NextResponse.json(
        { error: 'Project status not found' },
        { status: 404 }
      )
    }

    // Check if project is live
    if (projectData.status !== 'live') {
      return NextResponse.json(
        { error: 'Project is not live' },
        { status: 400 }
      )
    }

    // Check for duplicate sends - only send if data has changed
    console.log('🔄 Checking for previous launch email sends...')
    const { data: lastEmailSend } = await supabaseAdmin
      .from('manual_email_sends')
      .select('trigger_values, sent_at')
      .eq('user_id', userId)
      .eq('email_type', 'website_launch')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single()

    if (lastEmailSend) {
      const lastValues = lastEmailSend.trigger_values
      const currentValues = {
        status: projectData.status,
        final_url: projectData.final_url || ''
      }

      const hasChanged = (
        lastValues?.status !== currentValues.status ||
        lastValues?.final_url !== currentValues.final_url
      )

      if (!hasChanged) {
        console.log('⏸️ Email not sent - project status/URL unchanged since last send')
        return NextResponse.json({
          success: false,
          message: 'Email not sent - project status and URL have not changed since last send',
          lastSent: lastEmailSend.sent_at,
          reason: 'No changes detected'
        }, { status: 400 })
      }

      console.log('✅ Project data has changed since last send, proceeding...')
    } else {
      console.log('✅ No previous launch email found, proceeding with first send...')
    }

    // Get business name
    const { data: kickoffData } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .single()

    // Send email directly
    const emailResult = await sendWebsiteLaunchEmail({
      customerEmail: userData.user.email,
      customerName: userData.user.user_metadata?.full_name || userData.user.email,
      businessName: kickoffData?.business_name || null,
      websiteUrl: projectData.final_url || 'https://yourwebsite.com',
      launchedAt: new Date().toISOString(),
    })

    // Record the email send in tracking table to prevent duplicates
    try {
      const { error: trackingError } = await supabaseAdmin
        .from('manual_email_sends')
        .insert({
          user_id: userId,
          email_type: 'website_launch',
          sent_by: null, // Could be enhanced to track admin user
          trigger_values: {
            status: projectData.status,
            final_url: projectData.final_url || ''
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
    console.log(`✅ Launch email sent to ${userData.user.email} for ${kickoffData?.business_name || 'project'}`)

    return NextResponse.json({
      success: true,
      message: 'Website launch email sent',
      customerEmail: userData.user.email
    })

  } catch (error: any) {
    console.error('💥 Error sending launch email:', error)
    return NextResponse.json(
      { error: 'Failed to send launch email' },
      { status: 500 }
    )
  }
}
