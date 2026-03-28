-- Quick Setup Script for Drawing Suggestion AI
-- Execute these steps in order in your Supabase SQL Editor

-- STEP 1: Create the database schema
-- Copy and paste the contents of: migration-scripts/drawing-ai-schema.sql

-- STEP 2: Create storage buckets (OPTION A - SQL)
-- Copy and paste the contents of: migration-scripts/storage-buckets-setup.sql

-- STEP 2: Create storage buckets (OPTION B - Dashboard UI)
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Create bucket "drawings" (public, 50MB limit, PDF only)
-- 4. Create bucket "documents" (public, 100MB limit, PDF and images)

-- STEP 3: Make yourself an admin
-- Replace 'YOUR_EMAIL_HERE' with your actual email address
INSERT INTO admin_users (user_id, role, permissions)
SELECT 
  id as user_id,
  'super_admin' as role,
  '{"manage_rules": true, "manage_documents": true}'::jsonb as permissions
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'  -- ← CHANGE THIS TO YOUR EMAIL
ON CONFLICT (user_id) DO NOTHING;

-- STEP 4: Verify your admin status
-- This should return your user record if successful
SELECT 
  au.*,
  u.email
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id
WHERE u.email = 'YOUR_EMAIL_HERE';  -- ← CHANGE THIS TO YOUR EMAIL

-- STEP 5: Check that NKBA rules were created
-- This should return 7 default rules
SELECT 
  rule_code,
  title,
  category,
  severity
FROM nkba_rules
ORDER BY category, rule_code;

-- DONE! You can now:
-- 1. Log in to your application
-- 2. Navigate to "Drawing Suggestion AI"
-- 3. Click "Admin Panel" button (should be visible)
-- 4. Start adding/managing NKBA rules and documents

-- TROUBLESHOOTING:
-- If Admin Panel button is not visible:
-- 1. Check that your email matches exactly in the admin_users table
-- 2. Try logging out and logging back in
-- 3. Check browser console for errors

-- If file uploads fail:
-- 1. Verify storage buckets exist in Supabase Dashboard
-- 2. Check storage policies are created
-- 3. Verify VITE_GEMINI_API_KEY is set in .env.local

-- If AI analysis fails:
-- 1. Check that VITE_GEMINI_API_KEY is valid
-- 2. Check browser console for API errors
-- 3. Verify NKBA rules exist in database
