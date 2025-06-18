import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWebsiteLaunchEmail } from '@/lib/email'

// Use service role for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Processing website launch notification for user:', userId)

    // Fetch user details
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !userData?.user) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch project status to get final_url and check if status is 'live'
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from('project_status')
      .select('status, final_url')
      .eq('user_id', userId)
      .single()

    if (projectError) {
      console.error('Error fetching project status:', projectError)
      return NextResponse.json(
        { error: 'Project status not found' },
        { status: 404 }
      )
    }

    // Check if website status is 'live'
    if (projectData.status !== 'live') {
      return NextResponse.json(
        { error: 'Website status is not set to live yet' },
        { status: 400 }
      )
    }

    // Check if final_url is provided
    if (!projectData.final_url) {
      return NextResponse.json(
        { error: 'Final URL is not set' },
        { status: 400 }
      )
    }

    // Fetch business name from kickoff form
    let businessName = null
    const { data: kickoffData, error: kickoffError } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', userId)
      .single()
    
    if (!kickoffError && kickoffData) {
      businessName = kickoffData.business_name
    }

    // Send email to customer
    const emailResult = await sendWebsiteLaunchEmail({
      customerEmail: userData.user.email,
      customerName: userData.user.user_metadata?.full_name || userData.user.email,
      businessName: businessName,
      websiteUrl: projectData.final_url,
      launchedAt: new Date().toISOString(),
    })

    console.log('Website launch email sent successfully to customer')

    return NextResponse.json({
      success: true,
      message: 'Website launch notification sent to customer',
      customerEmail: userData.user.email,
      businessName: businessName,
      finalUrl: projectData.final_url,
      emailResult: emailResult,
    })
  } catch (error) {
    console.error('Error sending website launch notification:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send website launch notification', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Website launch notification endpoint',
    usage: 'POST with { userId: "uuid" } to send website launch email to customer'
  })
}
