-- HOW TO MANUALLY TRIGGER EMAILS
-- These commands will guarantee the triggers fire

-- 1. To trigger DEMO READY email manually:
-- First, make at least one demo URL empty
UPDATE demo_links 
SET option_3_url = NULL 
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- Then fill it back (this will trigger the email)
UPDATE demo_links 
SET option_3_url = 'https://demo3-manual-test.com'
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 2. To trigger WEBSITE LAUNCH email manually:
-- First, change status away from 'live'
UPDATE project_status 
SET status = 'pending'
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- Then change it back to 'live' (this will trigger the email)
UPDATE project_status 
SET status = 'live'
WHERE user_id = 'a23cd6e7-ef58-48fa-802b-24371b27f328';

-- 3. ALTERNATIVE: Test with a different user
-- Find a user with incomplete demos:
SELECT 
    user_id,
    option_1_url,
    option_2_url,
    option_3_url,
    CASE 
        WHEN option_1_url IS NULL OR option_1_url = '' OR
             option_2_url IS NULL OR option_2_url = '' OR
             option_3_url IS NULL OR option_3_url = ''
        THEN 'INCOMPLETE - GOOD FOR TESTING'
        ELSE 'COMPLETE - WONT TRIGGER'
    END as trigger_status
FROM demo_links 
ORDER BY updated_at DESC
LIMIT 10;

-- Then complete the demos for that user to trigger the email
