-- Manual SQL script to set a user as admin
-- Replace 'your-user-email@example.com' with the actual email of the user you want to make admin

-- First, find the user ID (replace with actual email)
SELECT id, email FROM auth.users WHERE email = 'your-user-email@example.com';

-- Set the user as admin (replace the id with the actual user ID from above)
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'user-id-from-above';

-- Verify the change
SELECT up.id, au.email, up.full_name, up.role, up.created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.role = 'admin';

-- Example of setting a specific user (replace with actual data):
-- UPDATE user_profiles SET role = 'admin' WHERE id = '12345678-1234-1234-1234-123456789012';
