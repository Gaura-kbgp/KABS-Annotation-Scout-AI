-- FIX INFINITE RECURSION IN RLS POLICIES
-- Run this in Supabase SQL Editor immediately!

-- 1. Create a secure function to check admin status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role text;
BEGIN
  -- We select directly from the table. Since this function is SECURITY DEFINER,
  -- it bypasses RLS on the table, preventing the infinite loop.
  SELECT role INTO current_role FROM public.user_profiles WHERE id = auth.uid();
  RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Admins can do everything" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can do everything on user_profiles" ON public.user_profiles;

-- 3. Re-create non-recursive policies
CREATE POLICY "Admins can do everything" ON public.user_profiles
  FOR ALL USING (
    public.is_admin() = true OR
    auth.uid() = id
  );

-- Also ensure project policies are safe
DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;
CREATE POLICY "Admins can manage all projects" ON public.projects
  FOR ALL USING (
    public.is_admin() = true OR
    auth.uid() = user_id
  );
