-- User Profiles for Access Control
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user', -- 'admin', 'user'
  is_active BOOLEAN DEFAULT TRUE,
  access_expiry TIMESTAMPTZ, -- If NULL, assume no expiry (or unpaid? logic depends) -> Let's say NULL means "no access" unless is_active is true? 
  -- Better: access_expiry stores when their access stops. If > NOW(), they have access.
  -- For "Unpaid" users who get 1 month free, we set this.
  -- For "Paid" users, we might set this based on subscription.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Admins can view/edit all profiles
CREATE POLICY "Admins can do everything on user_profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
    OR
    -- Bootstrapping: Allow if the table is empty or specific admin email?
    -- For now, let's allow service role full access (default) and authenticated users read own.
    (auth.uid() = id)
  );

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, is_active, access_expiry)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    TRUE, 
    NOW() + INTERVAL '30 days' -- Default 30 days trial/access? 
    -- Or user wants "auto stop access after one month". So default 1 month.
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial Admin Profile if not exists (You might need to manually run this or link to existing auth user)
-- This part is tricky without knowing the exact Admin UUID. 
-- The user has an 'admin_users' table in previous schema. We should probably merge concepts.
-- For now, I'll rely on the existing Admin Dashboard logic or the new 'role' column.

