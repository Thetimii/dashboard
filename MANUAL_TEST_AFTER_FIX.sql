-- MANUAL TEST PROCEDURE
-- Do this step by step to verify the fix works

-- 1. First, make sure data is properly set
UPDATE demo_links 
SET 
    option_1_url = 'https://demo1-manual.com',
    option_2_url = 'https://demo2-manual.com', 
    option_3_url = 'https://demo3-manual.com'
WHERE user_id = 'd5b3cedb-ca44-42a1-8ff7-ff6e3251b25f';

-- 2. Set project status to live
UPDATE project_status 
SET 
    status = 'live',
    final_url = 'https://live-website-manual.com'
WHERE user_id = 'd5b3cedb-ca44-42a1-8ff7-ff6e3251b25f';

-- 3. COMMIT the transaction (this happens automatically in SQL Editor)

-- 4. Wait 2 seconds, then test APIs manually:
-- curl -X POST https://app.customerflows.ch/api/notify-demo-ready -H "Content-Type: application/json" -d '{"userId": "d5b3cedb-ca44-42a1-8ff7-ff6e3251b25f"}'
-- curl -X POST https://app.customerflows.ch/api/notify-website-launch -H "Content-Type: application/json" -d '{"userId": "d5b3cedb-ca44-42a1-8ff7-ff6e3251b25f"}'

-- 5. Both should return 200 and send emails successfully
