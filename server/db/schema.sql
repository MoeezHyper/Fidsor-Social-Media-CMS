-- ======================================================
-- FIDSOR SOCIAL MEDIA CMS - SUPABASE DATABASE SCHEMA
-- ======================================================

-- 1. Create Custom User Profiles & Permissions Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  can_publish_facebook BOOLEAN NOT NULL DEFAULT true,
  can_publish_instagram BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Published Posts Log Table
CREATE TABLE IF NOT EXISTS public.published_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT,
  caption TEXT,
  image_url TEXT,
  platforms JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_posts ENABLE ROW LEVEL SECURITY;

-- Service Role / Public Access Policies
CREATE POLICY "Allow public read access to user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow service role full access to user_profiles" ON public.user_profiles FOR ALL USING (true);

CREATE POLICY "Allow public read access to published_posts" ON public.published_posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert to published_posts" ON public.published_posts FOR INSERT WITH CHECK (true);

-- Trigger to automatically create user_profile entry when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, role, can_publish_facebook, can_publish_instagram)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE((NEW.raw_user_meta_data->>'can_publish_facebook')::boolean, true),
    COALESCE((NEW.raw_user_meta_data->>'can_publish_instagram')::boolean, true)
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Default Admin Account Details:
-- Username: admin
-- Password: Admin123!
-- Email: admin@fidsor.cms
