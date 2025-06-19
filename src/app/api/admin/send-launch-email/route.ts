import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { sendWebsiteLaunchEmail } from '@/lib/email'

const supabaseAdmin = createClient()

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
    
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🚀 Processing website launch email for user:', userId)

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
