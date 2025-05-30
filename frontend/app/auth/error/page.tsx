'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Component to handle params after Suspense boundary
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    
    console.log('Auth Error:', error);
    console.log('Error Description:', errorDesc);
    
    let message = 'An authentication error occurred';
    let details = '';
    
    // Common NextAuth error messages
    if (error === 'Configuration') {
      message = 'There is a problem with the server configuration.';
      details = 'Check that your NEXTAUTH_SECRET and GitHub credentials are set correctly.';
    } else if (error === 'AccessDenied') {
      message = 'Access denied. You may not have permission to sign in.';
      details = 'The GitHub app may have denied your request.';
    } else if (error === 'Verification') {
      message = 'The verification link may have been used or has expired.';
    } else if (error === 'OAuthSignin') {
      message = 'Error starting the GitHub sign-in process.';
      details = 'Check your GitHub client ID and NEXTAUTH_URL settings.';
    } else if (error === 'OAuthCallback') {
      message = 'Error completing the GitHub sign-in process.';
      details = 'Check your GitHub client secret and callback URL configuration.';
    } else if (error === 'OAuthCreateAccount') {
      message = 'Could not create user account with GitHub credentials.';
    } else if (error) {
      message = `Authentication error: ${error}`;
      if (errorDesc) details = errorDesc;
    }
    
    setErrorMessage(message);
    setErrorDetails(details);
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 starry-bg">
      <div className="max-w-md w-full bg-black bg-opacity-70 p-8 rounded-lg border border-red-500">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
        
        <p className="text-white mb-4">{errorMessage}</p>
        
        {errorDetails && (
          <p className="text-gray-300 mb-6 text-sm">{errorDetails}</p>
        )}
        
        <div className="space-y-4">
          <div className="border border-gray-700 rounded p-4 text-gray-300">
            <h2 className="text-lg font-medium mb-2">Troubleshooting Steps:</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Check that your <code>.env.local</code> file has all required variables</li>
              <li>Verify that your GitHub OAuth app has the correct callback URL: <code>http://localhost:3000/api/auth/callback/github</code></li>
              <li>Make sure your GitHub Client ID and Secret are correctly copied</li>
              <li>Restart your Next.js server after updating environment variables</li>
              <li>Try using an incognito/private browser window</li>
            </ul>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/"
              className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              Return to Home
            </Link>
            <Link 
              href="/api/auth/debug"
              target="_blank"
              className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
            >
              Debug Auth Config
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main auth error component with Suspense
export default function AuthError() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center starry-bg">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>}>
      <AuthErrorContent />
    </Suspense>
  );
} 