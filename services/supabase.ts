import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const SUPABASE_URL = 'https://jzgocimbraxghmvdqwno.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z29jaW1icmF4Z2htdmRxd25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzE1MDgsImV4cCI6MjA4MTY0NzUwOH0.tdwtf5fLG2omLFKowXP2p7C4z5zVeNR5UdDwHnmhVjE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * DATABASE & STORAGE SETUP INSTRUCTIONS
 * 
 * 1. DATABASE (SQL Editor):
 * 
 * create table projects (
 *   id uuid default gen_random_uuid() primary key,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   name text not null,
 *   user_id uuid not null references auth.users(id),
 *   status text default 'draft',
 *   pdf_url text,
 *   current_page integer default 1,
 *   total_pages integer default 1,
 *   annotations jsonb default '[]'::jsonb
 * );
 * 
 * alter table projects enable row level security;
 * 
 * create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
 * create policy "Users can insert own projects" on projects for insert with check (auth.uid() = user_id);
 * create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
 * create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);
 * 
 * 2. STORAGE (Storage Menu):
 * 
 * - Create a new Bucket named 'project-files'.
 * - Toggle 'Public bucket' to ON.
 * - Save.
 * - (Ideally) Add policies to allow authenticated users to Upload, Update, and Delete objects in this bucket.
 */