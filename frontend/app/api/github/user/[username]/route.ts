import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/utils/auth';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // Get the username from URL params
    const username = params.username;
    
    // Get the current session to access GitHub token
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      console.error('No GitHub access token found in session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Make request to GitHub API with the access token
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${session.accessToken}`,
        'User-Agent': 'AstroGit-App'
      }
    });
    
    if (!response.ok) {
      console.error('GitHub API error:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch GitHub data' },
        { status: response.status }
      );
    }
    
    // Parse and return the GitHub user data
    const userData = await response.json();
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error in GitHub user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 