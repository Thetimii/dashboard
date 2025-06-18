# Email System Testing Guide

## ✅ **COMPLETED FIXES**
- Fixed duplicate email logic in dashboard page
- Fixed email recipient bug (was sending to admin instead of customer)
- Fixed baseURL construction to use production URL instead of localhost
- Created correct database triggers with production API URLs

## 🧪 **TEST PROCEDURES**

### **1. Test API Endpoints Directly**
```bash
# Test demo ready notification (replace with real user ID)
curl -X POST https://app.customerflows.ch/api/notify-demo-ready \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-real-user-id-here"}'

# Test website launch notification (replace with real user ID)
curl -X POST https://app.customerflows.ch/api/notify-website-launch \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-real-user-id-here"}'
```

### **2. Test Database Triggers**
After applying `FINAL_SETUP.sql` in Supabase SQL Editor:

```sql
-- Test demo ready trigger (replace with real user ID)
UPDATE demo_links 
SET option_1_url = 'https://demo1.test', 
    option_2_url = 'https://demo2.test', 
    option_3_url = 'https://demo3.test'
WHERE user_id = 'your-real-user-id-here';

-- Test website launch trigger (replace with real user ID)
UPDATE project_status 
SET status = 'live'
WHERE user_id = 'your-real-user-id-here';
```

### **3. Verify Database Setup**
```sql
-- Check triggers are created
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%notification%';

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'notify_%';
```

## 🎯 **EXPECTED RESULTS**

### **When Demo Links Are Complete:**
- Customer receives email: "Your website demos are ready!"
- Email contains links to all 3 demo options
- Sent to customer's email address (not admin)

### **When Website Goes Live:**
- Customer receives email: "Your website is now live!"
- Email contains live website URL
- Sent to customer's email address (not admin)

### **Admin Notifications:**
- Admin receives emails when customers complete kickoff forms
- Admin receives emails when customers approve demos
- Admin receives emails when payments are completed

## 🔧 **DEBUGGING**

If emails aren't working:

1. **Check Supabase Logs:** Database → Logs → check for HTTP errors
2. **Check Vercel Logs:** Check function logs for API calls
3. **Test API directly:** Use curl commands above
4. **Verify triggers:** Use SQL queries above

## 📋 **FINAL CHECKLIST**

- [ ] Applied `FINAL_SETUP.sql` in Supabase SQL Editor
- [ ] Verified triggers exist with SQL query
- [ ] Tested demo ready email with real user ID
- [ ] Tested website launch email with real user ID
- [ ] Confirmed customer receives emails (not admin)
- [ ] Checked Supabase logs for any errors

## 🎉 **SYSTEM IS READY!**

Once all tests pass, your email notification system is fully operational:
- Customers get notified when demos are ready
- Customers get notified when websites go live  
- Admin gets notified of all customer actions
- All emails are sent reliably via Resend API
