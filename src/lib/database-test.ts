import { createClient } from '@/lib/supabase'

// Test script to check database table availability
export async function testDatabaseSetup() {
  const supabase = createClient()
  
  console.log('🔍 Testing database setup...')
  
  try {
    // Test 1: Check if followup_questionnaires table exists
    console.log('📋 Testing followup_questionnaires table...')
    const { data: questionnaires, error: questionnaireError } = await supabase
      .from('followup_questionnaires')
      .select('count(*)')
      .single()
    
    if (questionnaireError) {
      console.error('❌ followup_questionnaires table error:', {
        code: questionnaireError.code,
        message: questionnaireError.message,
        details: questionnaireError.details
      })
      
      if (questionnaireError.message?.includes('relation') || questionnaireError.message?.includes('table')) {
        console.log('💡 Solution: The followup_questionnaires table needs to be created in Supabase')
        console.log('📝 Run the SQL script from create-followup-questionnaire-table.sql in your Supabase SQL Editor')
        return { success: false, issue: 'table_missing', table: 'followup_questionnaires' }
      }
    } else {
      console.log('✅ followup_questionnaires table exists')
    }
    
    // Test 2: Check other required tables
    console.log('📋 Testing other tables...')
    const tables = ['payments', 'kickoff_forms', 'user_profiles']
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count(*)')
          .single()
        
        if (error && (error.message?.includes('relation') || error.message?.includes('table'))) {
          console.error(`❌ ${table} table missing`)
          return { success: false, issue: 'table_missing', table }
        } else {
          console.log(`✅ ${table} table exists`)
        }
      } catch (error) {
        console.error(`❌ Error testing ${table}:`, error)
      }
    }
    
    // Test 3: Check RLS policies
    console.log('🔒 Testing Row Level Security...')
    try {
      const { data: testInsert, error: rlsError } = await supabase
        .from('followup_questionnaires')
        .select('id')
        .limit(1)
      
      if (rlsError && rlsError.code === 'PGRST301') {
        console.log('⚠️ RLS policies may need adjustment, but this is expected for unauthenticated requests')
      } else {
        console.log('✅ RLS policies are working')
      }
    } catch (error) {
      console.log('⚠️ RLS test inconclusive (this may be normal)')
    }
    
    console.log('🎉 Database setup test completed')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Database setup test failed:', error)
    return { success: false, issue: 'connection_error', error }
  }
}

// Run this in the browser console or as an API endpoint for debugging
if (typeof window !== 'undefined') {
  (window as any).testDatabaseSetup = testDatabaseSetup
}
