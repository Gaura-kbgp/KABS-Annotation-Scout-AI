-- MASTER FIX SCRIPT
-- Run this in Supabase SQL Editor to resolve all 404/500 errors.

-- 1. Create 'user_profiles' table (if missing)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  access_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
DROP POLICY IF EXISTS "Admins can do everything" ON public.user_profiles;
CREATE POLICY "Admins can do everything" ON public.user_profiles
  FOR ALL USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin' OR
    auth.uid() = id -- Let users read themselves? see below
  );

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
  
-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, is_active, access_expiry)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    TRUE, 
    NOW() + INTERVAL '30 days'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create 'projects' table (if missing)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft', -- 'draft', 'saved'
  pdf_url TEXT,
  annotations JSONB DEFAULT '[]'::jsonb,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
DROP POLICY IF EXISTS "Users can do everything on own projects" ON public.projects;
CREATE POLICY "Users can do everything on own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);


-- 3. Fix Storage Bucket 'project-files'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  true,
  52428800,
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload project files" ON storage.objects;
CREATE POLICY "Users can upload project files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view project files" ON storage.objects;
CREATE POLICY "Users can view project files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-files');

DROP POLICY IF EXISTS "Users can delete project files" ON storage.objects;
CREATE POLICY "Users can delete project files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
