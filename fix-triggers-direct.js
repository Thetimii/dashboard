// Direct Supabase Database Inspector and Trigger Fixer
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uotcrojwdxzacjznrvcj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdGNyb2p3ZHh6YWNqem5ydmNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTY2NzcyOSwiZXhwIjoyMDY1MjQzNzI5fQ.ey7Sy1oFgYTgebSHHO-o9QUFYZ4TBa5iBY8frKxae0U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectDatabase() {
  console.log('🔍 INSPECTING YOUR SUPABASE DATABASE...\n')

  // 1. Check demo_links table structure
  try {
    console.log('📋 DEMO_LINKS TABLE STRUCTURE:')
    const { data: demoLinksStructure, error: structureError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = 'demo_links'
          ORDER BY ordinal_position;
        `
      })
    
    if (structureError) {
      // Try alternative method
      const { data: demoData, error: demoError } = await supabase
        .from('demo_links')
        .select('*')
        .limit(1)
      
      if (demoData && demoData.length > 0) {
        console.log('Sample demo_links record:', JSON.stringify(demoData[0], null, 2))
      } else {
        console.log('No demo_links records found, or error:', demoError)
      }
    } else {
      console.log('Columns:', demoLinksStructure)
    }
  } catch (error) {
    console.error('Error inspecting demo_links:', error)
  }

  // 2. Check existing triggers
  try {
    console.log('\n🔧 EXISTING TRIGGERS:')
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, event_object_table')
      .eq('trigger_schema', 'public')
      .like('trigger_name', '%demo%')
    
    if (triggers && triggers.length > 0) {
      console.log('Found triggers:', triggers)
    } else {
      console.log('No demo triggers found')
    }
  } catch (error) {
    console.log('Could not check triggers via table, will use SQL')
  }

  // 3. Check recent demo_links data
  try {
    console.log('\n📊 RECENT DEMO_LINKS DATA:')
    const { data: recentData, error: dataError } = await supabase
      .from('demo_links')
      .select('*')
      .order('id', { ascending: false })
      .limit(3)
    
    if (recentData && recentData.length > 0) {
      console.log('Recent records:')
      recentData.forEach(record => {
        console.log(`- User: ${record.user_id}, URLs: [${record.option_1_url ? '✓' : '✗'}] [${record.option_2_url ? '✓' : '✗'}] [${record.option_3_url ? '✓' : '✗'}]`)
      })
    } else {
      console.log('No demo_links data found')
    }
  } catch (error) {
    console.error('Error fetching demo_links data:', error)
  }

  // 4. Check users
  try {
    console.log('\n👥 AVAILABLE USERS:')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (users && users.users.length > 0) {
      console.log('Found users:')
      users.users.slice(0, 3).forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}`)
      })
    } else {
      console.log('No users found')
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

async function fixTriggers() {
  console.log('\n🛠️  FIXING TRIGGERS...\n')
  
  // Create the complete trigger fix SQL
  const fixSQL = `
-- Enable HTTP extension
CREATE EXTENSION IF NOT EXISTS http;

-- Create or replace the demo ready notification function
CREATE OR REPLACE FUNCTION notify_demo_ready()
RETURNS TRIGGER AS $$
DECLARE
  api_url text;
  payload jsonb;
  result record;
  all_demos_ready boolean;
  were_demos_ready_before boolean;
BEGIN
  -- Add detailed logging for debugging
  RAISE LOG 'Demo trigger fired! Operation: %, User: %', TG_OP, NEW.user_id;
  
  -- Check if all 3 demo options are now filled (not null and not empty)
  all_demos_ready := (
    NEW.option_1_url IS NOT NULL AND NEW.option_1_url != '' AND
    NEW.option_2_url IS NOT NULL AND NEW.option_2_url != '' AND
    NEW.option_3_url IS NOT NULL AND NEW.option_3_url != ''
  );
  
  RAISE LOG 'All demos ready: %, URLs: [%], [%], [%]', 
    all_demos_ready, NEW.option_1_url, NEW.option_2_url, NEW.option_3_url;
  
  -- Check if demos were ready before (for UPDATE operations)
  were_demos_ready_before := CASE 
    WHEN TG_OP = 'INSERT' THEN false
    ELSE (
      OLD.option_1_url IS NOT NULL AND OLD.option_1_url != '' AND
      OLD.option_2_url IS NOT NULL AND OLD.option_2_url != '' AND
      OLD.option_3_url IS NOT NULL AND OLD.option_3_url != ''
    )
  END;
  
  RAISE LOG 'Were demos ready before: %, Operation: %', were_demos_ready_before, TG_OP;
  
  -- Only send notification if demos are ready now but weren't ready before
  IF all_demos_ready AND NOT were_demos_ready_before THEN
    
    RAISE LOG 'TRIGGER CONDITION MET! Sending notification for user: %', NEW.user_id;
    
    -- Build the API URL
    api_url := 'https://app.customerflows.ch/api/notify-demo-ready';
    
    -- Build the payload
    payload := jsonb_build_object(
      'userId', NEW.user_id::text
    );
    
    RAISE LOG 'Making API call to: % with payload: %', api_url, payload;
    
    -- Make HTTP request to our API endpoint
    BEGIN
      SELECT INTO result
        content::json->'success' as success,
        status_code
      FROM http((
        'POST',
        api_url,
        ARRAY[
          http_header('Content-Type', 'application/json')
        ],
        'application/json',
        payload::text
      )::http_request);
      
      -- Log the result
      RAISE LOG 'Demo ready notification API call result: status=%, success=%', 
        result.status_code, result.success;
        
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE LOG 'Failed to call demo ready notification API: %', SQLERRM;
    END;
  ELSE
    RAISE LOG 'TRIGGER CONDITION NOT MET: all_demos_ready=%, were_demos_ready_before=%', 
      all_demos_ready, were_demos_ready_before;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS demo_ready_notification_trigger ON public.demo_links;
DROP TRIGGER IF EXISTS demo_ready_notification_trigger_insert ON public.demo_links;

-- Create UPDATE trigger
CREATE TRIGGER demo_ready_notification_trigger
  AFTER UPDATE ON public.demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- Create INSERT trigger (this is what should fire for new entries)
CREATE TRIGGER demo_ready_notification_trigger_insert
  AFTER INSERT ON public.demo_links
  FOR EACH ROW
  EXECUTE FUNCTION notify_demo_ready();

-- Grant permissions
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated, service_role;
  `

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixSQL })
    
    if (error) {
      console.error('❌ Error executing trigger fix SQL:', error)
    } else {
      console.log('✅ Triggers fixed successfully!')
    }
  } catch (error) {
    console.error('❌ Error fixing triggers:', error)
  }
}

async function testTrigger() {
  console.log('\n🧪 TESTING TRIGGER...\n')
  
  // Get a user to test with
  try {
    const { data: users } = await supabase.auth.admin.listUsers()
    
    if (!users || users.users.length === 0) {
      console.log('❌ No users found to test with')
      return
    }
    
    const testUserId = users.users[0].id
    console.log(`🎯 Testing with user: ${testUserId}`)
    
    // Insert a test demo_links record with all 3 URLs
    const { data, error } = await supabase
      .from('demo_links')
      .insert({
        user_id: testUserId,
        option_1_url: 'https://test1.example.com',
        option_2_url: 'https://test2.example.com',
        option_3_url: 'https://test3.example.com'
      })
      .select()
    
    if (error) {
      console.error('❌ Error inserting test data:', error)
    } else {
      console.log('✅ Test data inserted successfully!')
      console.log('📋 Check your Supabase logs for trigger execution messages')
      console.log('🔍 Go to: Supabase Dashboard → Database → Logs')
      console.log('🔍 Look for: "Demo trigger fired! Operation: INSERT"')
    }
  } catch (error) {
    console.error('❌ Error testing trigger:', error)
  }
}

async function main() {
  await inspectDatabase()
  await fixTriggers()
  await testTrigger()
  
  console.log('\n🎉 COMPLETE! Check your Supabase logs to see if the trigger fired.')
}

main().catch(console.error)
