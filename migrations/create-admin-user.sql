-- FIXED ADMIN USER SETUP
-- This grants admin privileges to the specified account
-- Email: Contact@kbglobalpartners.com
-- Password: admin@kabs

-- IMPORTANT: Run this ONCE in Supabase SQL Editor after setting up the database

-- Step 1: Ensure the user exists in auth.users (Create manually in Supabase Dashboard if not)
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Email: Contact@kbglobalpartners.com
-- 4. Password: admin@kabs
-- 5. Check "Auto Confirm User"
-- 6. Click "Create User"

-- Step 2: Create/Update the Admin Profile
INSERT INTO public.user_profiles (id, email, role, is_active, access_expiry)
SELECT 
  id,
  email,
  'admin',
  true,
  NOW() + INTERVAL '100 years' -- Permanent access
FROM auth.users
WHERE email = 'Contact@kbglobalpartners.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  is_active = true,
  access_expiry = NOW() + INTERVAL '100 years';

-- Step 3: Verify the admin user profile
SELECT * FROM public.user_profiles 
WHERE email = 'Contact@kbglobalpartners.com';

