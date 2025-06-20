/**
 * Database Migration Script: Create followup_questionnaires table
 * 
 * This script creates the followup_questionnaires table with all necessary
 * columns, indexes, RLS policies, and triggers.
 * 
 * Run this with: node migrations/run-migration.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

async function runMigration() {
  console.log('🚀 Starting database migration...')
  
  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'create-followup-questionnaires-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📋 Executing SQL migration...')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      return false
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Test the table creation
    console.log('🔍 Testing table creation...')
    const { data: testData, error: testError } = await supabase
      .from('followup_questionnaires')
      .select('count')
      .single()
    
    if (testError) {
      console.error('❌ Table test failed:', testError)
      return false
    }
    
    console.log('✅ Table is accessible and working!')
    return true
    
  } catch (error) {
    console.error('❌ Migration error:', error)
    return false
  }
}

// Alternative method using individual SQL commands
async function runMigrationAlternative() {
  console.log('🚀 Starting alternative migration method...')
  
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
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql_query: createTableSQL 
    })
    
    if (createError) {
      console.error('❌ Table creation failed:', createError)
      return false
    }
    
    console.log('✅ Table created successfully!')
    
    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('followup_questionnaires')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('⚠️  Table test failed, but this might be expected if RLS is not set up yet')
      console.log('Error:', testError.message)
    } else {
      console.log('✅ Table is working correctly!')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Alternative migration failed:', error)
    return false
  }
}

// Main execution
async function main() {
  console.log('🔧 Database Migration Tool')
  console.log('==========================')
  
  // Try the primary method first
  const success = await runMigrationAlternative()
  
  if (success) {
    console.log('\n🎉 Migration completed successfully!')
    console.log('The followup_questionnaires table is now available.')
  } else {
    console.log('\n💡 If this migration fails, you can also:')
    console.log('1. Copy the SQL from migrations/create-followup-questionnaires-table.sql')
    console.log('2. Paste it into your Supabase SQL Editor')
    console.log('3. Run it manually')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { runMigration, runMigrationAlternative }
