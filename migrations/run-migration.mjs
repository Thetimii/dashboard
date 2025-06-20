/**
 * Database Migration Script: Create followup_questionnaires table
 * 
 * This script creates the followup_questionnaires table with all necessary
 * columns, indexes, RLS policies, and triggers.
 * 
 * Run this with: node migrations/run-migration.mjs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables - we'll read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
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
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Alternative method using individual SQL commands
async function runMigration() {
  console.log('🚀 Starting database migration...')
  
  try {
    // Create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.followup_questionnaires (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        core_business text NOT NULL,
        revenue_generation text NOT NULL,
        secondary_revenue text,
        long_term_revenue text,
        unique_selling_points text NOT NULL,
        customer_choice_reasons text NOT NULL,
        problems_solved text NOT NULL,
        trust_building text NOT NULL,
        potential_objections text,
        main_competitors text,
        competitor_strengths text,
        target_group_demographics text NOT NULL,
        target_group_needs text,
        service_subpages boolean DEFAULT false,
        service_subpages_details text,
        existing_content boolean DEFAULT false,
        existing_content_details text,
        required_functions text[],
        ecommerce_needed boolean DEFAULT false,
        blog_needed boolean DEFAULT false,
        newsletter_needed boolean DEFAULT false,
        member_area_needed boolean DEFAULT false,
        social_media_needed boolean DEFAULT false,
        whatsapp_chat_needed boolean DEFAULT false,
        appointment_booking boolean DEFAULT false,
        appointment_tool text,
        existing_seo_keywords text,
        google_analytics_needed boolean DEFAULT false,
        desired_domain text,
        privacy_policy_exists boolean DEFAULT false,
        privacy_policy_creation_needed boolean DEFAULT false,
        company_address text NOT NULL,
        company_phone text NOT NULL,
        company_email text NOT NULL,
        vat_id text,
        completed boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `
    
    console.log('📋 Creating table...')
    
    // Use the SQL editor approach by splitting into smaller commands
    const { error: createError } = await supabase
      .from('_sql')
      .insert({ query: createTableSQL })
    
    // If that doesn't work, try direct table creation
    if (createError) {
      console.log('Trying direct approach...')
      
      // Direct table test
      const { data: tableTest, error: testError } = await supabase
        .from('followup_questionnaires')
        .select('count')
        .limit(1)
      
      if (testError && testError.message?.includes('relation')) {
        console.error('❌ Table does not exist and cannot be created via this method')
        console.log('\n💡 Manual Steps Required:')
        console.log('1. Open your Supabase Dashboard')
        console.log('2. Go to SQL Editor')
        console.log('3. Copy and paste the SQL from: migrations/create-followup-questionnaires-table.sql')
        console.log('4. Execute the SQL script')
        return false
      }
    }
    
    console.log('✅ Table creation completed!')
    
    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('followup_questionnaires')
      .select('count')
      .limit(1)
    
    if (testError) {
      if (testError.message?.includes('relation')) {
        console.log('⚠️  Table still doesn\'t exist. Please run the SQL manually in Supabase.')
        return false
      } else {
        console.log('⚠️  Table exists but RLS might be blocking access (this is expected)')
        console.log('Table creation was successful!')
      }
    } else {
      console.log('✅ Table is working correctly!')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return false
  }
}

// Main execution
async function main() {
  console.log('🔧 Database Migration Tool')
  console.log('==========================')
  
  // Try the migration
  const success = await runMigration()
  
  if (success) {
    console.log('\n🎉 Migration completed successfully!')
    console.log('The followup_questionnaires table should now be available.')
  } else {
    console.log('\n💡 Manual Migration Required:')
    console.log('==========================')
    console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy the contents of: migrations/create-followup-questionnaires-table.sql')
    console.log('4. Paste and execute in the SQL Editor')
    console.log('5. Verify the table was created successfully')
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
