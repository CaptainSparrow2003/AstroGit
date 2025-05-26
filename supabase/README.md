# Supabase Setup for AstroGit

This directory contains SQL scripts to set up your Supabase database for the AstroGit application.

## Getting Started

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. After your project is created, navigate to the SQL Editor in the Supabase dashboard
3. Copy the contents of `schema.sql` and paste it into a new SQL query in the editor
4. Run the SQL script to create all the necessary tables, functions, and policies

## Database Schema

The AstroGit application uses three main tables:

### 1. users

Extends Supabase Auth with GitHub-specific user information:

- `id`: UUID from auth.users (primary key)
- `github_id`: GitHub user ID
- `name`: User's name
- `email`: User's email
- `avatar_url`: URL to user's GitHub avatar
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated

### 2. github_data

Stores GitHub statistics for each user:

- `id`: UUID (primary key)
- `user_id`: Foreign key reference to users table
- `commits`: Number of commits
- `stars`: Number of stars received
- `repos`: Number of repositories
- `followers`: Number of followers
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated

### 3. horoscopes

Stores generated horoscopes for users:

- `id`: UUID (primary key)
- `user_id`: Foreign key reference to users table
- `date`: Date of the horoscope
- `content`: Text content of the horoscope
- `traits`: JSON object containing trait scores (energy, charisma, creativity, collaboration)
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated

## Row Level Security

All tables have Row Level Security (RLS) enabled to ensure that users can only access their own data. The policies enforce:

1. Users can only view and update their own records
2. Users can only insert horoscopes linked to their own user ID

## Authentication Flow

When a user signs up with GitHub via NextAuth:

1. Supabase Auth creates a new entry in `auth.users`
2. The `handle_new_user` trigger function automatically creates a corresponding entry in the `users` table
3. The application will then fetch GitHub data and create records in `github_data` and `horoscopes` tables

## Environment Variables

After setting up your Supabase project, you'll need to add these values to your environment variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

For the frontend `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Manually Running SQL Queries

You can use the SQL Editor in the Supabase dashboard to run queries against your database for testing or debugging purposes.

Example queries:

```sql
-- View all users
SELECT * FROM public.users;

-- View a specific user's horoscopes
SELECT * FROM public.horoscopes WHERE user_id = 'user-uuid-here';

-- Update GitHub data for a user
UPDATE public.github_data 
SET commits = 250, stars = 120, repos = 15, followers = 75
WHERE user_id = 'user-uuid-here';
``` 