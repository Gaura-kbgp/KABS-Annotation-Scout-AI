-- MIGRATION: ADD TEAM COLLABORATION
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Add team_members column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb;

-- 2. Update RLS policies to allow team collaboration
-- Remove existing restrictive policy
DROP POLICY IF EXISTS "Users can do everything on own projects" ON public.projects;

-- Allow owners to do EVERYTHING
CREATE POLICY "Owners have full access" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

-- Allow Team Members (Viewers) to SELECT
CREATE POLICY "Team members can view projects" ON public.projects
  FOR SELECT USING (
    team_members @> jsonb_build_array(jsonb_build_object('email', auth.jwt() ->> 'email'))
  );

-- Allow Team Members (Editors) to UPDATE (annotate)
CREATE POLICY "Team editors can update projects" ON public.projects
  FOR UPDATE USING (
    team_members @> jsonb_build_array(jsonb_build_object('email', auth.jwt() ->> 'email', 'role', 'editor'))
  );

-- 3. Enable Realtime updates for this table
-- This MUST be run for live updates to work!
-- Note: If you get an error here, it means the publication already exists or the table is already added.
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
