import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const SUPABASE_URL = 'https://jzgocimbraxghmvdqwno.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z29jaW1icmF4Z2htdmRxd25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzE1MDgsImV4cCI6MjA4MTY0NzUwOH0.tdwtf5fLG2omLFKowXP2p7C4z5zVeNR5UdDwHnmhVjE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to mock project storage since we cannot create buckets easily in this environment
// In production, we would upload the PDF file to Supabase Storage.
// Here we will use local FileReader for the session to render, 
// and store minimal metadata in the DB.
