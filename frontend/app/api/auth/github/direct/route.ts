import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  // Get GitHub OAuth credentials from environment variables
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${baseUrl}/api/auth/callback/github`;
  
  // Check if GitHub client ID is set
  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub client ID not configured' },
      { status: 500 }
    );
  }
  
  // Construct GitHub OAuth URL
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.append('client_id', clientId);
  githubAuthUrl.searchParams.append('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.append('scope', 'read:user user:email');
  githubAuthUrl.searchParams.append('state', Date.now().toString());
  
  console.log('Direct GitHub Auth - Redirecting to:', githubAuthUrl.toString());
  
  // Redirect to GitHub OAuth page
  return NextResponse.redirect(githubAuthUrl.toString());
} 