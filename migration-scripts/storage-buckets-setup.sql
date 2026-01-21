-- Supabase Storage Buckets Setup for Drawing Suggestion AI
-- Run this in Supabase SQL Editor or use the Supabase Dashboard UI

-- Create 'drawings' bucket for uploaded kitchen floor plans
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'drawings',
  'drawings',
  true,  -- Set to false if you want authenticated-only access
  52428800,  -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create 'documents' bucket for NKBA reference PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,  -- Set to false if you want authenticated-only access
  104857600,  -- 100MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'drawings' bucket
-- Allow authenticated users to upload their own drawings
CREATE POLICY "Users can upload own drawings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'drawings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own drawings
CREATE POLICY "Users can read own drawings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'drawings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own drawings
CREATE POLICY "Users can delete own drawings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'drawings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for 'documents' bucket
-- Only admins can upload documents
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  )
);

-- Everyone can read documents
CREATE POLICY "Anyone can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  )
);

-- Note: If you prefer to use the Supabase Dashboard UI instead:
-- 1. Go to Storage section
-- 2. Click "New bucket"
-- 3. Create bucket named "drawings" with public access
-- 4. Create bucket named "documents" with public access
-- 5. Set appropriate file size limits and MIME types
