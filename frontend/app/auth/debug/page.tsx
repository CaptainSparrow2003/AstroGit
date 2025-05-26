'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DebugInfo {
  message: string;
  timestamp: string;
  environment: {
    nextauthUrl: string;
    nextauthUrlMatch: string;
    currentUrl: string;
    nextauthSecret: string;
    githubClientId: string;
    githubClientSecret: string;
    apiUrl: string;
    nodeEnv: string;
  };
  sessionStatus: string;
  githubCallbackUrl: string;
  troubleshooting: {
    missingEnvVars: string[];
    nextSteps: string[];
  };
}

export default function AuthDebugPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        const response = await fetch('/api/auth/debug');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setDebugInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch debug info');
      } finally {
        setLoading(false);
      }
    }

    fetchDebugInfo();
  }, []);

  return (
    <main className="min-h-screen p-6 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Auth Debug Information</h1>
        
        <Link 
          href="/"
          className="inline-block mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Home
        </Link>
        
        {loading && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-white">Loading debug information...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900 border border-red-500 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-white">{error}</p>
            <p className="text-gray-300 mt-4">
              This could indicate that the debug API route is not working correctly.
              Check your server logs for more information.
            </p>
          </div>
        )}
        
        {debugInfo && (
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Environment Variables</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded">
                  <p className="text-gray-300">NEXTAUTH_URL: <span className={`font-mono ${debugInfo.environment.nextauthUrl === 'NOT SET' ? 'text-red-400' : 'text-green-400'}`}>
                    {debugInfo.environment.nextauthUrl}
                  </span></p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <p className="text-gray-300">URL Match: <span className={`font-mono ${debugInfo.environment.nextauthUrlMatch === 'MISMATCH' ? 'text-red-400' : 'text-green-400'}`}>
                    {debugInfo.environment.nextauthUrlMatch}
                  </span></p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <p className="text-gray-300">Current URL: <span className="font-mono text-blue-400">
                    {debugInfo.environment.currentUrl}
                  </span></p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <p className="text-gray-300">NEXTAUTH_SECRET: <span className={`font-mono ${debugInfo.environment.nextauthSecret === 'NOT SET' ? 'text-red-400' : 'text-green-400'}`}>
                    {debugInfo.environment.nextauthSecret}
                  </span></p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <p className="text-gray-300">GITHUB_CLIENT_ID: <span className={`font-mono ${debugInfo.environment.githubClientId === 'NOT SET' ? 'text-red-400' : 'text-green-400'}`}>
                    {debugInfo.environment.githubClientId}
                  </span></p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <p className="text-gray-300">GITHUB_CLIENT_SECRET: <span className={`font-mono ${debugInfo.environment.githubClientSecret === 'NOT SET' ? 'text-red-400' : 'text-green-400'}`}>
                    {debugInfo.environment.githubClientSecret}
                  </span></p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Session Information</h2>
              <p className="text-gray-300">Status: <span className="font-mono text-blue-400">{debugInfo.sessionStatus}</span></p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">GitHub Callback URL</h2>
              <p className="text-gray-300 mb-2">Make sure this URL is configured in your GitHub OAuth app:</p>
              <p className="font-mono text-green-400 bg-gray-700 p-3 rounded">{debugInfo.githubCallbackUrl}</p>
            </div>
            
            {debugInfo.troubleshooting.missingEnvVars.length > 0 && (
              <div className="bg-red-900 border border-red-500 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-white mb-4">Missing Environment Variables</h2>
                <ul className="list-disc pl-5 text-white">
                  {debugInfo.troubleshooting.missingEnvVars.map((variable, index) => (
                    <li key={index}>{variable}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Next Steps</h2>
              <ol className="list-decimal pl-5 text-gray-300 space-y-2">
                {debugInfo.troubleshooting.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Run Fix-Auth Script</h2>
              <p className="text-gray-300 mb-4">
                For automatic troubleshooting, run the fix-auth script from the terminal:
              </p>
              <div className="bg-gray-700 p-3 rounded">
                <code className="text-green-400 font-mono">node scripts/fix-auth.js</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 