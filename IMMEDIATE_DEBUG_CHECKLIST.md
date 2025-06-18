# IMMEDIATE DEBUGGING CHECKLIST

## 🔍 **Step 1: Check Supabase Setup**

1. **Go to Supabase Dashboard**
2. **Run `SUPABASE_DEBUG.sql` queries ONE BY ONE**
3. **Check each result:**

### Expected Results:
- ✅ HTTP extension should exist
- ✅ 2 triggers should exist (demo_ready, website_launch)  
- ✅ 2 functions should exist (notify_demo_ready, notify_website_launch)
- ✅ project_status table should have 'status' column (not 'website_is_live')

## 🔍 **Step 2: Check API Endpoints**

Test these URLs in your browser (should return JSON):
- `https://app.customerflows.ch/api/notify-demo-ready`
- `https://app.customerflows.ch/api/notify-website-launch`

## 🔍 **Step 3: Common Issues**

### Issue 1: HTTP Extension Not Enabled
**Symptom**: Triggers exist but no API calls made
**Fix**: Run in Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS http;
```

### Issue 2: Wrong API URLs  
**Symptom**: Triggers fire but API calls fail
**Check**: Supabase logs show 404 errors
**Fix**: Verify `app.customerflows.ch` is your correct domain

### Issue 3: No Data to Trigger
**Symptom**: Everything looks right but nothing happens
**Fix**: You need actual data changes:
```sql
-- For demo ready trigger, ALL 3 URLs must be filled:
UPDATE demo_links SET 
  option_1_url = 'https://demo1.test.com',
  option_2_url = 'https://demo2.test.com', 
  option_3_url = 'https://demo3.test.com'
WHERE user_id = 'your-real-user-id';

-- For website launch trigger:
UPDATE project_status SET status = 'live' 
WHERE user_id = 'your-real-user-id';
```

### Issue 4: Permissions
**Symptom**: Functions exist but can't execute
**Fix**: Run in Supabase:
```sql
GRANT EXECUTE ON FUNCTION notify_demo_ready() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION notify_website_launch() TO authenticated, service_role;
```

## 🚨 **Quick Test**

1. **Run the complete `FINAL_DATABASE_SETUP.sql`** 
2. **Get a real user_id**: `SELECT id FROM auth.users LIMIT 1;`
3. **Test demo trigger**:
   ```sql
   UPDATE demo_links SET option_3_url = 'https://test3.com' 
   WHERE user_id = 'real-user-id';
   ```
4. **Check Supabase Logs** (Dashboard > Logs > Database)
5. **Look for**: "Demo ready notification: status=200, success=true"

## 📞 **If Still Not Working**

Tell me the results of the debug queries and I'll help you fix the specific issue!
