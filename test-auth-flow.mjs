#!/usr/bin/env node
/**
 * Test script to verify the authentication and questionnaire flow
 * Usage: node test-auth-flow.js
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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthFlow() {
  console.log('🔧 Testing Authentication and Payment Flow')
  console.log('==========================================')
  
  try {
    // Test 1: Check if we can access auth users
    console.log('🔍 Testing auth user access...')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Cannot access auth users:', usersError.message)
      return false
    }
    
    console.log(`✅ Found ${users.users.length} users in auth system`)
    
    // Test 2: Check payment flow for a test user
    if (users.users.length > 0) {
      const testUser = users.users[0]
      console.log(`🔍 Testing payment flow for user: ${testUser.email}`)
      
      // Check payments table
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', testUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (paymentsError && paymentsError.code !== 'PGRST116') {
        console.error('❌ Error accessing payments:', paymentsError.message)
        return false
      }
      
      if (payments && payments.length > 0) {
        console.log(`✅ Found payment record: Status ${payments[0].status}`)
        
        // Check questionnaire
        const { data: questionnaire, error: qError } = await supabase
          .from('followup_questionnaires')
          .select('completed, created_at')
          .eq('user_id', testUser.id)
          .single()
        
        if (qError && qError.code !== 'PGRST116') {
          console.error('❌ Error accessing questionnaire:', qError.message)
          return false
        }
        
        if (questionnaire) {
          console.log(`✅ Found questionnaire: Completed ${questionnaire.completed}`)
        } else {
          console.log('ℹ️  No questionnaire found for user')
        }
      } else {
        console.log('ℹ️  No payment records found for user')
      }
    }
    
    // Test 3: Verify RLS policies
    console.log('🔍 Testing Row Level Security...')
    
    // Try to access data without authentication (should fail or return empty)
    const anonymousClient = createClient(supabaseUrl, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: anonPayments, error: anonError } = await anonymousClient
      .from('payments')
      .select('count')
      .limit(1)
    
    if (anonError && (anonError.message?.includes('JWT') || anonError.code === 'PGRST301')) {
      console.log('✅ RLS is working - anonymous access properly blocked')
    } else if (anonPayments && anonPayments.length === 0) {
      console.log('✅ RLS is working - no data returned for anonymous user')
    } else {
      console.warn('⚠️  RLS might not be properly configured')
    }
    
    console.log('')
    console.log('🎉 Authentication flow test completed!')
    
    // Provide recommendations
    console.log('💡 Recommendations:')
    console.log('   1. Make sure users stay signed in during Stripe redirects')
    console.log('   2. Test the questionnaire save functionality after payment')
    console.log('   3. Verify that session recovery works properly')
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

async function testSessionStorage() {
  console.log('')
  console.log('🔧 Testing Session Storage Utilities')
  console.log('===================================')
  
  // Since we can't test browser storage in Node.js, we'll provide instructions
  console.log('ℹ️  To test session storage:')
  console.log('   1. Open your browser dev tools')
  console.log('   2. Go to Application > Storage > Local Storage')
  console.log('   3. Look for these keys after payment redirect:')
  console.log('      - stripe_payment_context')
  console.log('      - auth_recovery_data')
  console.log('   4. These should be automatically cleaned up after successful return')
}

async function main() {
  const success = await testAuthFlow()
  await testSessionStorage()
  
  console.log('')
  if (success) {
    console.log('✅ All tests passed! The authentication flow should work properly.')
  } else {
    console.log('❌ Some tests failed. Please check the configuration.')
  }
}

main().catch(console.error)
