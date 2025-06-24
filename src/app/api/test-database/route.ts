import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Admin client with service role for testing
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Test if table exists and what records are in it
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from('manual_email_sends')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('📊 Manual email sends table data:', { tableData, tableError })

    // Test table structure
    const { data: structureData, error: structureError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'manual_email_sends' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })

    console.log('🏗️ Table structure:', { structureData, structureError })

    return NextResponse.json({
      tableExists: !tableError,
      recordCount: tableData?.length || 0,
      recentRecords: tableData,
      tableStructure: structureData,
      errors: { tableError, structureError }
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
