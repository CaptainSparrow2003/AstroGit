'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if username exists before redirecting
      const response = await fetch(`/api/github/user/${username}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`GitHub user '${username}' not found`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }
      }
      
      // Username exists, redirect to dashboard with the username
      router.push(`/dashboard?username=${encodeURIComponent(username)}`);
    } catch (error) {
      console.error('Error checking username:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 starry-bg">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit">
          <code className="font-mono font-bold">AstroGit - Your Coding Horoscope</code>
        </p>
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
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-md mb-6 max-w-md">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full max-w-md mb-8">
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="flex-grow px-4 py-3 rounded-md border border-gray-600 bg-black bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 border border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md font-semibold text-white transition-all duration-200 ease-in-out ${
                isLoading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isLoading ? 'Loading...' : 'Get Horoscope'}
            </button>
          </div>
        </form>
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
            Enter your GitHub username to generate your coding horoscope.
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