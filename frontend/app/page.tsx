'use client';

import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setSignInError(null);
      
      console.log('Starting GitHub sign-in process...');
      
      // Verify that we're in a browser environment before checking window.location
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
      console.log('Current URL:', currentUrl);
      
      // Attempt to sign in with GitHub
      const result = await signIn('github', { 
        callbackUrl: '/dashboard',
        redirect: true
      });
      
      // This code will only run if redirect is set to false
      if (result?.error) {
        console.error('Sign-in error:', result.error);
        setSignInError(`Authentication failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Sign-in error:', error);
      setSignInError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 starry-bg">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit">
          <code className="font-mono font-bold">AstroGit - Your Coding Horoscope</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          {status === 'authenticated' ? (
            <Link href="/dashboard" className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0">
              Go to Dashboard
            </Link>
          ) : (
            <span className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0">
              Sign in to continue
            </span>
          )}
        </div>
      </div>

      <div className="relative flex place-items-center flex-col before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] text-center">
        <h1 className="text-4xl font-bold mb-6 mt-20">Discover Your Coding Horoscope</h1>
        <p className="text-xl mb-10">Unlock insights about your coding style based on your GitHub activity</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center mb-10">
          <div className="border border-gray-700 rounded-lg p-6 max-w-xs mx-auto bg-opacity-50 bg-black">
            <h3 className="text-xl font-semibold mb-2">Energy Level</h3>
            <p>Based on your commit frequency</p>
          </div>
          <div className="border border-gray-700 rounded-lg p-6 max-w-xs mx-auto bg-opacity-50 bg-black">
            <h3 className="text-xl font-semibold mb-2">Charisma</h3>
            <p>Based on stars your repos have received</p>
          </div>
          <div className="border border-gray-700 rounded-lg p-6 max-w-xs mx-auto bg-opacity-50 bg-black">
            <h3 className="text-xl font-semibold mb-2">Creativity</h3>
            <p>Based on the variety of repos you maintain</p>
          </div>
          <div className="border border-gray-700 rounded-lg p-6 max-w-xs mx-auto bg-opacity-50 bg-black">
            <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
            <p>Based on your followers and discussions</p>
          </div>
        </div>
        
        {signInError && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-md mb-6 max-w-md">
            <p className="font-bold">Sign-in Error:</p>
            <p>{signInError}</p>
            <p className="mt-2 text-sm">
              <Link href="/auth/debug" className="underline hover:text-blue-300">
                View auth debug information
              </Link>
            </p>
          </div>
        )}
        
        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className={`px-8 py-3 border border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md font-semibold text-white transition-all duration-200 ease-in-out ${
            isSigningIn 
              ? 'opacity-70 cursor-not-allowed' 
              : 'hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          {isSigningIn ? 'Signing in...' : 'Sign in with GitHub'}
        </button>
        
        <div className="mt-4 text-sm text-gray-400 flex flex-col items-center space-y-2">
          <Link href="/auth/debug" className="underline hover:text-blue-400">
            Debug Authentication
          </Link>
          <Link href="/auth/github" className="text-green-400 hover:text-green-300 font-medium">
            Try Direct GitHub Auth Page
          </Link>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-3 lg:text-left">
        <a
          href="https://github.com"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            GitHub{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Connect your GitHub account to generate your coding horoscope.
          </p>
        </a>

        <a
          href="https://nextjs.org/docs"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Learn how AstroGit interprets your coding stats.
          </p>
        </a>

        <a
          href="/about"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            About{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Learn more about the AstroGit project.
          </p>
        </a>
      </div>
    </main>
  );
} 