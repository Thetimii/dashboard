import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const supabaseAdmin = createClient()

export async function POST(request: NextRequest) {
  try {
    const { userId, emailType } = await request.json()

    if (!userId || !emailType) {
      return NextResponse.json(
        { error: 'User ID and email type are required' },
        { status: 400 }
      )
    }

    if (!['demo_ready', 'website_launch'].includes(emailType)) {
      return NextResponse.json(
        { error: 'Invalid email type. Must be demo_ready or website_launch' },
        { status: 400 }
      )
    }

    let canSend = false
    let reason = ''
    let currentData = null

    if (emailType === 'demo_ready') {
      // Check demo email eligibility
      const { data: result, error } = await supabaseAdmin
        .rpc('can_send_demo_email', { target_user_id: userId })

      if (error) {
        throw error
      }

      canSend = result

      // Get current demo data for display
      const { data: demoData } = await supabaseAdmin
        .from('demo_links')
        .select('option_1_url, option_2_url, option_3_url')
        .eq('user_id', userId)
        .single()

      currentData = demoData

      if (!canSend) {
        const allFilled = demoData?.option_1_url && demoData?.option_2_url && demoData?.option_3_url
        if (!allFilled) {
          reason = 'Not all demo URLs are filled'
        } else {
          reason = 'Email already sent for current demo URLs'
        }
      }

    } else if (emailType === 'website_launch') {
      // Check launch email eligibility
      const { data: result, error } = await supabaseAdmin
        .rpc('can_send_launch_email', { target_user_id: userId })

      if (error) {
        throw error
      }

      canSend = result

      // Get current project data for display
      const { data: projectData } = await supabaseAdmin
        .from('project_status')
        .select('status, final_url')
        .eq('user_id', userId)
        .single()

      currentData = projectData

      if (!canSend) {
        if (projectData?.status !== 'live') {
          reason = 'Project status is not set to live'
        } else {
          reason = 'Email already sent for current live status'
        }
      }
    }

    // Get last email send info
    const { data: lastSent } = await supabaseAdmin
      .from('manual_email_sends')
      .select('sent_at, sent_by, trigger_values')
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      canSend,
      reason,
      currentData,
      lastSent,
      emailType
    })

  } catch (error: any) {
    console.error('Error checking email eligibility:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check email eligibility', 
        details: error.message || 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
