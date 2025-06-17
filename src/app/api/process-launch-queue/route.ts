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
    console.log('Processing website launch notification queue...')

    // Fetch unprocessed notifications from queue
    const { data: queueItems, error: queueError } = await supabaseAdmin
      .from('website_launch_queue')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(10) // Process max 10 at a time

    if (queueError) {
      console.error('Error fetching queue items:', queueError)
      return NextResponse.json(
        { error: 'Failed to fetch queue items' },
        { status: 500 }
      )
    }

    if (!queueItems || queueItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending notifications to process',
        processedCount: 0
      })
    }

    console.log(`Found ${queueItems.length} pending notifications`)

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const item of queueItems) {
      try {
        // Fetch user details
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(item.user_id)
        
        if (userError || !userData?.user) {
          console.error('Error fetching user for queue item:', item.id, userError)
          errorCount++
          continue
        }

        // Fetch business name from kickoff form
        let businessName = null
        const { data: kickoffData, error: kickoffError } = await supabaseAdmin
          .from('kickoff_forms')
          .select('business_name')
          .eq('user_id', item.user_id)
          .single()
        
        if (!kickoffError && kickoffData) {
          businessName = kickoffData.business_name
        }

        // Send email to customer
        const emailResult = await sendWebsiteLaunchEmail({
          userEmail: userData.user.email,
          userName: userData.user.user_metadata?.full_name || userData.user.email,
          businessName: businessName,
          finalUrl: item.final_url,
        })

        // Mark as processed
        const { error: updateError } = await supabaseAdmin
          .from('website_launch_queue')
          .update({ processed: true })
          .eq('id', item.id)

        if (updateError) {
          console.error('Error marking queue item as processed:', item.id, updateError)
        }

        console.log('Website launch email sent successfully for queue item:', item.id)

        results.push({
          queueId: item.id,
          userId: item.user_id,
          email: userData.user.email,
          businessName: businessName,
          finalUrl: item.final_url,
          success: true
        })

        successCount++

      } catch (error) {
        console.error('Error processing queue item:', item.id, error)
        
        results.push({
          queueId: item.id,
          userId: item.user_id,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        })

        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Queue processing completed',
      processedCount: queueItems.length,
      successCount: successCount,
      errorCount: errorCount,
      results: results
    })

  } catch (error) {
    console.error('Error processing website launch queue:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process website launch queue', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get queue status
    const { data: queueStats, error: statsError } = await supabaseAdmin
      .from('website_launch_queue')
      .select('processed')

    if (statsError) {
      return NextResponse.json(
        { error: 'Failed to fetch queue stats' },
        { status: 500 }
      )
    }

    const totalCount = queueStats?.length || 0
    const pendingCount = queueStats?.filter(item => !item.processed).length || 0
    const processedCount = totalCount - pendingCount

    return NextResponse.json({
      message: 'Website launch notification queue status',
      stats: {
        total: totalCount,
        pending: pendingCount,
        processed: processedCount
      },
      usage: 'POST to process pending notifications'
    })
  } catch (error) {
    console.error('Error fetching queue status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue status' },
      { status: 500 }
    )
  }
}
