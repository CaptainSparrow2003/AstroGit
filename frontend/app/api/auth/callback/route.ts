import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get all query parameters
  const { searchParams } = new URL(request.url);
  
  // Log all parameters for debugging
  console.log('Callback Debug - Search Params:', Object.fromEntries(searchParams.entries()));
  
  // Create a response object with all parameters
  const responseData = {
    message: 'GitHub OAuth Callback Debug',
    timestamp: new Date().toISOString(),
    params: Object.fromEntries(searchParams.entries()),
    headers: Object.fromEntries(
      Array.from(request.headers.entries())
        .filter(([key]) => !['cookie', 'authorization'].includes(key.toLowerCase()))
    ),
    nextSteps: [
      "Check if 'code' parameter exists - this indicates GitHub sent back an auth code",
      "Check if 'error' parameter exists - this indicates an error in the OAuth flow",
      "Verify your callback URL matches what's configured in your GitHub app",
      "Make sure NEXTAUTH_SECRET is properly set in your .env.local file"
    ]
  };
  
  return NextResponse.json(responseData);
} 