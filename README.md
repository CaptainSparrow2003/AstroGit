# AstroGit

AstroGit is a web application that generates your coding horoscope based on your GitHub activity. It analyzes metrics like commits (energy), stars (popularity), repositories (creativity), and followers (collaboration) to provide personalized coding insights.

## Project Structure

This project follows a clear separation between frontend and backend:

- **Frontend**: Next.js application with TailwindCSS for styling
- **Backend**: Express.js API server with Supabase for data storage
- **Database**: SQL schema files for Supabase setup

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A GitHub account
- A Supabase account

## Setup Instructions

### 1. GitHub OAuth Application

1. Go to your GitHub account settings > Developer settings > OAuth Apps
2. Create a new OAuth application:
   - Application name: AstroGit
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/auth/callback/github
3. Once created, generate a new client secret and note both the Client ID and Client Secret

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in the Supabase dashboard
3. Copy the contents of `supabase/schema.sql` and paste it into a new SQL query
4. Execute the query to create all the necessary tables:
   - `users` (id, github_id, name, email)
   - `github_data` (user_id, stars, commits, repos, followers)
   - `horoscopes` (user_id, date, content, traits)
5. Copy your Supabase URL and anon/public key from the API settings page

For more details on the database schema and setup, check the [Supabase README](./supabase/README.md).

### 3. Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### 4. Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret  # Generate a secure random string
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   To generate a secure NEXTAUTH_SECRET, you can use:
   ```
   openssl rand -base64 32
   ```

4. Verify your auth configuration:
   ```
   npm run check-auth
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Access the application at http://localhost:3000

## Troubleshooting GitHub Authentication

If you're having trouble with GitHub authentication, follow these steps:

### Common Issues and Solutions

1. **404 Error on /api/auth/error or other auth pages**:
   - Make sure your `.env.local` file has all the required variables
   - Check that NEXTAUTH_URL is set to the correct URL (e.g., http://localhost:3000)
   - Restart your Next.js server after updating environment variables

2. **GitHub OAuth Authorization Error**:
   - Verify that your GitHub OAuth app has the correct callback URL: `http://localhost:3000/api/auth/callback/github`
   - Make sure your GitHub client ID and secret are correctly copied to your `.env.local` file
   - Check if your GitHub OAuth app is still in "pending approval" state

3. **Configuration Error**:
   - Run the auth check script to identify configuration issues:
     ```
     npm run check-auth
     ```
   - Visit `/api/auth/debug` in your browser to see detailed diagnostic information

4. **"Sign in with GitHub" button not working**:
   - Open your browser's developer console to look for error messages
   - Check your network tab for failed requests to GitHub's OAuth endpoints
   - Verify that all the required Next.js API routes for auth are set up correctly

### Testing GitHub Authentication

1. Open your browser in an incognito/private window
2. Go to http://localhost:3000
3. Click "Sign in with GitHub"
4. If you're redirected to GitHub and then back to your app successfully, authentication is working
5. If you encounter errors, check the troubleshooting steps above

## Features

- GitHub OAuth authentication
- Fetches user's GitHub stats
- Generates personalized coding horoscopes
- Beautiful cosmic UI with trait visualizations
- Responsive design works on mobile and desktop
- Secure data storage with Supabase and Row Level Security
- Social sharing capabilities

## Database Schema

The application uses three main tables in Supabase:

1. **users** - Stores user profile information from GitHub
2. **github_data** - Stores GitHub statistics (commits, stars, repos, followers)
3. **horoscopes** - Stores generated horoscopes and trait scores

All tables have Row Level Security enabled to ensure data privacy.

## License

MIT