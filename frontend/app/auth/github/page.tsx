'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function GitHubAuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoStarting, setIsAutoStarting] = useState(true);

  // Auto-start the GitHub sign-in process when the page loads
  useEffect(() => {
    const startAuth = async () => {
      try {
        setIsLoading(true);
        console.log('Starting GitHub authentication flow...');
        
        // Use redirect: false to catch any errors
        const result = await signIn('github', { 
          callbackUrl: '/dashboard',
          redirect: false
        });
        
        console.log('Auth result:', result);
        
        if (result?.error) {
          setError(result.error);
          setIsAutoStarting(false);
        } else if (result?.url) {
          // Manually redirect to avoid any Next.js router complications
          window.location.href = result.url;
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Failed to start authentication');
        setIsAutoStarting(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAutoStarting) {
      startAuth();
    }
  }, [isAutoStarting]);

  const handleManualSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use redirect: true to let NextAuth handle the redirect
      await signIn('github', { 
        callbackUrl: '/dashboard',
        redirect: true
      });
    } catch (err) {
      console.error('Manual sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">GitHub Authentication</h1>
        
        {isLoading && isAutoStarting && (
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white">Starting GitHub authentication...</p>
            <p className="text-gray-400 text-sm mt-2">You should be redirected to GitHub shortly.</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900 border border-red-500 rounded-md p-4 mb-6">
            <h2 className="text-white font-semibold mb-2">Authentication Error</h2>
            <p className="text-white text-sm">{error}</p>
            <p className="text-gray-300 text-sm mt-2">
              This could be due to misconfigured OAuth credentials or callback URLs.
            </p>
          </div>
        )}
        
        {(!isLoading || !isAutoStarting) && (
          <div className="space-y-6">
            <button
              onClick={handleManualSignIn}
              disabled={isLoading}
              className={`w-full py-3 bg-[#2da44e] hover:bg-[#2c974b] text-white rounded-md flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>Sign in with GitHub</span>
                </>
              )}
            </button>
            
            <div className="flex justify-between text-sm">
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                Back to Home
              </Link>
              <Link href="/auth/debug" className="text-blue-400 hover:text-blue-300">
                Debug Auth
              </Link>
            </div>
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="text-white font-medium mb-2">Alternative Methods</h3>
              <div className="space-y-3">
                <Link 
                  href="/api/auth/github/direct"
                  className="block w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-center rounded-md"
                >
                  Try Direct GitHub Auth
                </Link>
                <p className="text-gray-400 text-xs">
                  This bypasses NextAuth and directly uses GitHub OAuth flow
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="text-white font-medium mb-2">Troubleshooting</h3>
              <ul className="text-gray-300 text-sm space-y-2 list-disc pl-5">
                <li>Make sure your GitHub OAuth app is properly configured</li>
                <li>Verify the callback URL is set to <code className="bg-gray-700 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/github` : '[origin]/api/auth/callback/github'}</code></li>
                <li>Check that your environment variables are correctly set</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 