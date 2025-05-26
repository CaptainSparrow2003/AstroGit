import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { headers } from 'next/headers';

export async function GET() {
  // This route is for debugging only - don't include in production
  const headersList = headers();
  const host = headersList.get('host') || 'unknown';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  // Get the current URL
  const currentUrl = `${protocol}://${host}`;
  
  // Check environment variables
  const envCheck = {
    nextauthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    nextauthUrlMatch: process.env.NEXTAUTH_URL === currentUrl ? 'MATCH' : 'MISMATCH',
    currentUrl: currentUrl,
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    githubClientId: process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
    apiUrl: process.env.NEXT_PUBLIC_API_URL ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
  };

  // Check for session (without passing authOptions to avoid circular imports)
  let sessionStatus = 'No session check attempted';
  try {
    // Try to get session without passing authOptions
    const session = await getServerSession();
    sessionStatus = session ? 'Session exists' : 'No active session';
  } catch (error) {
    sessionStatus = `Error checking session: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  // Check GitHub callback URL
  const callbackUrl = `${currentUrl}/api/auth/callback/github`;

  return NextResponse.json({
    message: 'Auth debug info',
    timestamp: new Date().toISOString(),
    environment: envCheck,
    sessionStatus,
    githubCallbackUrl: callbackUrl,
    troubleshooting: {
      missingEnvVars: Object.entries(envCheck)
        .filter(([key, value]) => value === 'NOT SET' && key !== 'nodeEnv')
        .map(([key]) => key),
      nextSteps: [
        "1. Make sure NEXTAUTH_URL matches your current URL",
        "2. Set NEXTAUTH_SECRET to a secure random string",
        "3. Verify GitHub OAuth credentials are correct",
        "4. Check your GitHub app's callback URL matches the one above",
        "5. Restart your Next.js server after fixing any issues"
      ]
    }
  });
} 