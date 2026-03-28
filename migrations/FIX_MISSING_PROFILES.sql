-- FIX SCRIPT: MISSING USER PROFILES & AUTO-CREATION TRIGGER
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Ensure the user_profiles table exists
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  access_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Define/Fix Trigger Function to Auto-Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, is_active, access_expiry)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    TRUE, 
    NOW() + INTERVAL '30 days' -- Default 30 days access
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. BACKFILL: Create profiles for existing users who are missing one
INSERT INTO public.user_profiles (id, email, role, is_active, access_expiry)
SELECT 
  id, 
  email, 
  'user', 
  TRUE, 
  NOW() + INTERVAL '30 days'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. Grant Permissions (Crucial for Client-Side visibility if needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;


-- 6. Setup Policies (Simplified for Visibility)
DROP POLICY IF EXISTS "Admins Full Access" ON public.user_profiles;
CREATE POLICY "Admins Full Access" ON public.user_profiles
  FOR ALL USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin' OR
    (auth.uid() = id) -- Users can manage themselves
  );

DROP POLICY IF EXISTS "Public Profile Read" ON public.user_profiles;
CREATE POLICY "Public Profile Read" ON public.user_profiles
  FOR SELECT USING (true); -- Allow reading profiles (needed for admin dashboard to fetch all?)
  -- Note: "Admins Full Access" usually covers admin fetching. 
  -- But if we want Admin Dashboard to see ALL, the Admin user needs a policy that returns true for all rows.
  
  -- REFINED POLICY FOR ADMIN VIEWING:
  -- We rely on the Service Role (supabaseAdmin in code) to bypass RLS for admin dashboard functionality if possible.
  -- But if using standard client, we need a policy.
