# 🧪 Testing Manual Email System

After running the SQL script to stop automatic emails, follow these steps to test the manual email system:

## 1. ✅ Verify Automatic Triggers Are Stopped

In Supabase SQL Editor, run:
```sql
-- Check that triggers are removed
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%demo%' OR trigger_name LIKE '%launch%';

-- Should return no rows
```

## 2. 🔍 Check Manual Email System

Navigate to your admin dashboard in the browser:
- Go to `/admin/projects/[project-id]` or `/admin/projects/[project-id]/edit`
- Look for the "Email Notifications" section
- You should see two cards: "📧 Demo Ready Email" and "🚀 Website Launch Email"

## 3. 🎯 Test Demo Ready Email

**Prerequisites:** Project must have all 3 demo URLs filled
- If demo URLs are filled, you should see "✅ Ready to Send"
- If not, you should see "⏸️ Not Available" with the reason
- Click "Send Demo Ready Email" button if available
- Check for success/error message

## 4. 🚀 Test Website Launch Email  

**Prerequisites:** Project status must be "live"
- If project status is "live", you should see "✅ Ready to Send"  
- If not, you should see "⏸️ Not Available" with the reason
- Click "Send Website Launch Email" button if available
- Check for success/error message

## 5. 📧 Verify Email Delivery

Check the email account of the project customer to confirm:
- Demo ready emails are received when manually triggered
- Website launch emails are received when manually triggered
- No automatic emails are being sent when data changes

## 6. 🔄 Test State Changes

**Demo Ready Test:**
1. Go to project edit page
2. Clear one demo URL, save project → Should show "Not Available"
3. Fill the demo URL again, save project → Should show "Ready to Send"
4. Button should be clickable again

**Website Launch Test:**  
1. Change project status from "live" to "in_progress" → Should show "Not Available"
2. Change back to "live" → Should show "Ready to Send"
3. Button should be clickable again

## 7. 📊 Check Tracking Data

In Supabase SQL Editor:
```sql
-- View manual email send history
SELECT 
  mes.*,
  up.full_name as sent_by_name,
  u.email as recipient_email
FROM manual_email_sends mes
LEFT JOIN user_profiles up ON mes.sent_by = up.id  
LEFT JOIN auth.users u ON mes.user_id = u.id
ORDER BY mes.sent_at DESC;
```

## 🎯 Expected Results

- ✅ Manual email buttons appear/disappear based on data conditions
- ✅ Emails are sent successfully when conditions are met
- ✅ No duplicate sends for same data state
- ✅ Email tracking records are created
- ✅ No automatic emails are triggered by data changes
- ✅ Component status updates in real-time

## 🚨 Troubleshooting

**If buttons don't appear:**
- Check browser console for JavaScript errors
- Verify project data is loading correctly
- Check if ManualEmailTrigger component is imported

**If emails don't send:**
- Check browser network tab for API call errors
- Check server logs for email sending errors
- Verify RESEND_API_KEY is configured correctly

**If automatic emails still send:**
- Re-run the SQL script to remove triggers
- Check if any other triggers exist in the database
- Verify database functions are properly dropped
