import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Starting database health check...')
    
    const supabase = createClient()
    const results = {
      timestamp: new Date().toISOString(),
      tables: {} as Record<string, { exists: boolean, error?: string }>,
      summary: { success: false, issues: [] as string[] }
    }
    
    // Test required tables
    const tablesToTest = [
      'followup_questionnaires',
      'payments', 
      'kickoff_forms',
      'user_profiles',
      'demo_links',
      'project_status'
    ]
    
    for (const tableName of tablesToTest) {
      try {
        console.log(`📋 Testing ${tableName} table...`)
        
        const { data, error } = await supabase
          .from(tableName)
          .select('count(*)')
          .single()
        
        if (error) {
          if (error.message?.includes('relation') || error.message?.includes('table')) {
            results.tables[tableName] = { 
              exists: false, 
              error: 'Table does not exist'
            }
            results.summary.issues.push(`${tableName} table missing`)
          } else if (error.code === 'PGRST116') {
            // No rows found - table exists but is empty
            results.tables[tableName] = { exists: true }
          } else {
            results.tables[tableName] = { 
              exists: true, // Assume it exists if we get other errors
              error: `${error.code}: ${error.message}`
            }
          }
        } else {
          results.tables[tableName] = { exists: true }
        }
        
        console.log(`${results.tables[tableName].exists ? '✅' : '❌'} ${tableName}`)
        
      } catch (error: any) {
        console.error(`❌ Error testing ${tableName}:`, error)
        results.tables[tableName] = { 
          exists: false, 
          error: error.message || 'Unknown error'
        }
        results.summary.issues.push(`${tableName} connection error`)
      }
    }
    
    // Check if all critical tables exist  
    const criticalTables = ['followup_questionnaires', 'payments', 'kickoff_forms']
    const missingCritical = criticalTables.filter(table => 
      !results.tables[table]?.exists
    )
    
    results.summary.success = missingCritical.length === 0
    
    if (missingCritical.length > 0) {
      results.summary.issues.push(`Critical tables missing: ${missingCritical.join(', ')}`)
    }
    
    console.log('🎯 Database health check completed:', {
      success: results.summary.success,
      issues: results.summary.issues.length
    })
    
    return NextResponse.json(results, { 
      status: results.summary.success ? 200 : 500 
    })
    
  } catch (error: any) {
    console.error('❌ Database health check failed:', error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Database health check failed',
      message: error.message,
      summary: { success: false, issues: ['Health check failed'] }
    }, { status: 500 })
  }
}

// Enable CORS for debugging
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
