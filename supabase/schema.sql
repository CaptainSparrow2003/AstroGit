-- AstroGit Database Schema for Supabase

-- Users Table (extending Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  github_id TEXT UNIQUE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view and update only their own records
CREATE POLICY "Users can view and update their own records" ON public.users
  FOR ALL USING (auth.uid() = id);

-- GitHub Data Table
CREATE TABLE IF NOT EXISTS public.github_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  commits INTEGER NOT NULL DEFAULT 0,
  stars INTEGER NOT NULL DEFAULT 0,
  repos INTEGER NOT NULL DEFAULT 0,
  followers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id) -- Each user can have only one github_data record
);

-- Enable Row Level Security on github_data table
ALTER TABLE public.github_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view and update only their own github data
CREATE POLICY "Users can view and update their own github data" ON public.github_data
  FOR ALL USING (auth.uid() = user_id);

-- Horoscopes Table
CREATE TABLE IF NOT EXISTS public.horoscopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  traits JSONB NOT NULL, -- Store traits as JSON: {energy, charisma, creativity, collaboration}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, date) -- Each user can have only one horoscope per day
);

-- Enable Row Level Security on horoscopes table
ALTER TABLE public.horoscopes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own horoscopes
CREATE POLICY "Users can view their own horoscopes" ON public.horoscopes
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own horoscopes
CREATE POLICY "Users can insert their own horoscopes" ON public.horoscopes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_github_data_updated_at
BEFORE UPDATE ON public.github_data
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_horoscopes_updated_at
BEFORE UPDATE ON public.horoscopes
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, github_id, name, email, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'provider_id', NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger that calls the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_github_data_user_id ON public.github_data(user_id);
CREATE INDEX idx_horoscopes_user_id ON public.horoscopes(user_id);
CREATE INDEX idx_horoscopes_date ON public.horoscopes(date); 