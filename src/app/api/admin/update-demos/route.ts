import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDemoReadyEmail } from '@/lib/email'

// Use service role for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, option1, option2, option3 } = body

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    if (!option1 || !option2 || !option3) {
      return NextResponse.json(
        { error: 'All three demo options (option1, option2, option3) are required' },
        { status: 400 }
      )
    }

    console.log('Admin updating demo links for user:', userEmail)

    // Find user by email
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json(
        { error: 'Error finding user' },
        { status: 500 }
      )
    }

    const user = authUsers.users.find(u => u.email === userEmail)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update or insert demo links
    const { data: existingDemo, error: fetchError } = await supabaseAdmin
      .from('demo_links')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing demo links:', fetchError)
      return NextResponse.json(
        { error: 'Error checking demo links' },
        { status: 500 }
      )
    }

    const demoData = {
      user_id: user.id,
      option_1_url: option1,
      option_2_url: option2,
      option_3_url: option3,
    }

    let updateResult
    if (existingDemo) {
      // Update existing record
      const { data, error } = await supabaseAdmin
        .from('demo_links')
        .update(demoData)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Error updating demo links:', error)
        return NextResponse.json(
          { error: 'Error updating demo links' },
          { status: 500 }
        )
      }
      updateResult = data
    } else {
      // Insert new record
      const { data, error } = await supabaseAdmin
        .from('demo_links')
        .insert(demoData)
        .select()

      if (error) {
        console.error('Error inserting demo links:', error)
        return NextResponse.json(
          { error: 'Error inserting demo links' },
          { status: 500 }
        )
      }
      updateResult = data
    }

    console.log('Demo links updated successfully:', updateResult)

    // Fetch business name from kickoff form
    let businessName = null
    const { data: kickoffData, error: kickoffError } = await supabaseAdmin
      .from('kickoff_forms')
      .select('business_name')
      .eq('user_id', user.id)
      .single()
    
    if (!kickoffError && kickoffData) {
      businessName = kickoffData.business_name
    }

    // Get current domain for dashboard URL
    const dashboardUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/dashboard`
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/dashboard`
        : 'http://localhost:3000/dashboard'

    // Send email to customer
    const { sendDemoReadyEmail } = await import('@/lib/email')
    const emailResult = await sendDemoReadyEmail({
      userEmail: user.email,
      userName: user.user_metadata?.full_name || user.email,
      businessName: businessName,
      option1Url: option1,
      option2Url: option2,
      option3Url: option3,
    })

    console.log('Demo ready email sent successfully to customer')

    return NextResponse.json({
      success: true,
      message: 'Demo links updated and customer notified successfully',
      customerEmail: user.email,
      businessName: businessName,
      demoLinks: {
        option1,
        option2,
        option3,
      },
      emailResult: emailResult,
    })
  } catch (error) {
    console.error('Error in admin demo update:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update demos and notify customer', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: ' demo update endpoint',
    usage: 'POST with { userEmail: "email", option1: "url", option2: "url", option3: "url" } to update demos and notify customer',
    example: {
      userEmail: 'customer@example.com',
      option1: 'https://demo1.example.com',
      option2: 'https://demo2.example.com',
      option3: 'https://demo3.example.com'
    }
  })
}
