-- CREATE MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Removed REFERENCES auth.users(id) to support bypass/mock users
    user_email TEXT NOT NULL,
    user_name TEXT, 
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- POLICIES (Relaxed for Bypass Mode)
-- 1. Support for both real Auth and Bypass/Mock users
CREATE POLICY "Enable all for messages" ON public.messages
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ENABLE REALTIME for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
