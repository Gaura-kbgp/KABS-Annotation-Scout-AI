-- Create User Profiles Table (Robust version)
-- Run this in your Supabase SQL Editor

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY, -- Removed REFERENCES auth.users for Guest support
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add missing columns just in case table existed without them
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='full_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='email') THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Revised for both Auth and Guest users)
-- Thoroughly cleanup old policies to prevent recursion
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Any guest can manage their own row" ON public.user_profiles;

-- Create ultra-simple policies
CREATE POLICY "Enable read for all" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Enable all for all" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. Function to handle new user signup (for real Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO UPDATE SET 
        email = excluded.email,
        full_name = COALESCE(user_profiles.full_name, excluded.full_name);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
