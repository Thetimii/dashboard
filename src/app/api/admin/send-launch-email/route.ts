import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { sendWebsiteLaunchEmail } from '@/lib/email'

const supabaseAdmin = createClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Manual website launch email trigger called')
    
    const { userId, adminUserId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🚀 Processing manual website launch email for user:', userId)

    // Check if email can be sent
    const { data: canSend, error: checkError } = await supabaseAdmin
      .rpc('can_send_launch_email', { target_user_id: userId })

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
        { error: 'Email cannot be sent. Either project is not live or email was already sent for current status.' },
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

    // Get project data
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from('project_status')
      .select('status, final_url')
      .eq('user_id', userId)
      .single()

    if (projectError || !projectData) {
      console.error('❌ Project status not found:', projectError)
      return NextResponse.json(
        { error: 'Project status not found: ' + (projectError?.message || 'No project status found') },
        { status: 404 }
      )
    }

    console.log('✅ Project data found:', {
      status: projectData.status,
      final_url: projectData.final_url ? 'PRESENT' : 'MISSING'
    })

    // Get business name
    const { data: kickoffData } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .single()

    // Send email to customer
    const emailResult = await sendWebsiteLaunchEmail({
      customerEmail: userData.user.email,
      customerName: userData.user.user_metadata?.full_name || userData.user.email,
      businessName: kickoffData?.business_name || null,
      websiteUrl: projectData.final_url || 'https://yourwebsite.com',
      launchedAt: new Date().toISOString(),
    })

    console.log('📧 Email send result:', emailResult)

    // Record the email send
    const { data: recordId, error: recordError } = await supabaseAdmin
      .rpc('record_email_send', {
        target_user_id: userId,
        email_type_param: 'website_launch',
        admin_user_id: adminUserId
      })

    if (recordError) {
      console.error('⚠️ Failed to record email send:', recordError)
      // Don't fail the request, email was sent successfully
    }

    console.log('✅ Website launch email sent successfully!')

    return NextResponse.json({
      success: true,
      message: 'Website launch notification sent to customer',
      customerEmail: userData.user.email,
      emailResult: emailResult,
      recordId: recordId
    })

  } catch (error: any) {
    console.error('💥 CRITICAL ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send website launch notification', 
        details: error.message || 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
