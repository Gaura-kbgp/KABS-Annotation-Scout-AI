-- FIX: Create missing 'project-files' bucket
-- Run this in Supabase SQL Editor

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  true, -- PUBLIC bucket
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS
-- (Storage objects table has RLS enabled by default, but we define policies below)

-- 3. Policy: Allow Authenticated users to UPLOAD their own files
DROP POLICY IF EXISTS "Users can upload project files" ON storage.objects;
CREATE POLICY "Users can upload project files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: Allow Authenticated users to UPDATE/DELETE their own files
DROP POLICY IF EXISTS "Users can update/delete project files" ON storage.objects;
CREATE POLICY "Users can update/delete project files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete project files" ON storage.objects;
CREATE POLICY "Users can delete project files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Allow Public Read
DROP POLICY IF EXISTS "Users can view project files" ON storage.objects;
CREATE POLICY "Users can view project files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-files');
