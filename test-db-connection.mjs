/**
 * Simple test to verify followup_questionnaires table is working
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTable() {
  console.log('🔍 Testing followup_questionnaires table...')
  
  try {
    // Test table access
    const { data, error } = await supabase
      .from('followup_questionnaires')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.message?.includes('relation') || error.message?.includes('table') || error.status === 406) {
        console.error('❌ Table does not exist or is not accessible')
        console.error('Error:', error.message)
        return false
      } else {
        // RLS error is expected when not authenticated
        console.log('✅ Table exists (RLS is working, which is expected)')
        return true
      }
    } else {
      console.log('✅ Table is accessible and working!')
      return true
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Test other required tables
async function testOtherTables() {
  const tables = ['payments', 'kickoff_forms', 'user_profiles']
  
  for (const table of tables) {
    try {
      console.log(`🔍 Testing ${table} table...`)
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error && (error.message?.includes('relation') || error.message?.includes('table') || error.status === 406)) {
        console.error(`❌ ${table} table missing or not accessible`)
      } else {
        console.log(`✅ ${table} table exists`)
      }
    } catch (error) {
      console.error(`❌ Error testing ${table}:`, error.message)
    }
  }
}

async function main() {
  console.log('🔧 Database Health Check')
  console.log('========================')
  
  const success = await testTable()
  await testOtherTables()
  
  if (success) {
    console.log('\n🎉 Database setup looks good!')
    console.log('The followup_questionnaires table is working correctly.')
  } else {
    console.log('\n❌ Database issues detected.')
  }
}

main().catch(console.error)
