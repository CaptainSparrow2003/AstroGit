'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import HoroscopeCard from '@/components/HoroscopeCard';
import { GithubData, Horoscope } from '@/types/horoscope';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [githubData, setGithubData] = useState<GithubData | null>(null);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchGithubData();
    }
  }, [status, session]);

  useEffect(() => {
    if (githubData) {
      generateHoroscope();
    }
  }, [githubData]);

  const fetchGithubData = async () => {
    setLoading(true);
    try {
      // In a real app, we'd use the GitHub username from the session
      // This is a simplified example
      const username = session?.user?.name || 'octocat';
      
      const response = await fetch(`/api/github/user/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub data');
      }
      
      const userData = await response.json();
      
      // We're mocking this data for demo purposes
      // In a real app, we'd fetch real stats from the GitHub API
      const mockData: GithubData = {
        commits: Math.floor(Math.random() * 500) + 100,
        stars: Math.floor(Math.random() * 200) + 50,
        repos: userData.public_repos || Math.floor(Math.random() * 20) + 5,
        followers: userData.followers || Math.floor(Math.random() * 100) + 10
      };
      
      setGithubData(mockData);
    } catch (err) {
      console.error('Error fetching GitHub data:', err);
      setError('Failed to fetch your GitHub data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateHoroscope = async () => {
    if (!githubData || !session?.user) return;
    
    try {
      const response = await fetch('/api/horoscope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id || 'demo-user',
          githubData,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate horoscope');
      }
      
      const data = await response.json();
      setHoroscope(data);
    } catch (err) {
      console.error('Error generating horoscope:', err);
      setError('Failed to generate your coding horoscope. Please try again later.');
      
      // For demo purposes, generate a mock horoscope if API fails
      setHoroscope({
        date: new Date().toISOString().split('T')[0],
        traits: {
          energy: Math.min(Math.ceil(githubData.commits / 50), 10),
          charisma: Math.min(Math.ceil(githubData.stars / 100), 10),
          creativity: Math.min(Math.ceil(githubData.repos / 5), 10),
          collaboration: Math.min(Math.ceil(githubData.followers / 50), 10)
        },
        message: "Your coding energy is running high. Great time to tackle challenging projects! Your code's charisma is getting attention. Keep sharing your insights. Your creative coding spirit is showing potential. Try a new programming paradigm. Your collaborative alignment is harmonious. Join more group discussions."
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center starry-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Reading the stars...</h1>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 starry-bg">
      <h1 className="text-3xl font-bold mb-10">Your Coding Horoscope</h1>
      
      {error ? (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-md mb-6">
          {error}
        </div>
      ) : null}
      
      {session?.user && (
        <div className="flex flex-col items-center mb-8">
          {session.user.image && (
            <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-purple-500">
              <Image 
                src={session.user.image} 
                alt={session.user.name || 'GitHub User'} 
                fill
                className="object-cover"
              />
            </div>
          )}
          <h2 className="text-xl font-semibold">{session.user.name}</h2>
        </div>
      )}

      {githubData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-3xl">
          <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg mb-1">Commits</h3>
            <p className="text-2xl font-bold">{githubData.commits}</p>
          </div>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg mb-1">Stars</h3>
            <p className="text-2xl font-bold">{githubData.stars}</p>
          </div>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg mb-1">Repos</h3>
            <p className="text-2xl font-bold">{githubData.repos}</p>
          </div>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg mb-1">Followers</h3>
            <p className="text-2xl font-bold">{githubData.followers}</p>
          </div>
        </div>
      )}

      {horoscope && (
        <>
          <HoroscopeCard 
            horoscope={horoscope} 
            username={session?.user?.name || 'Developer'} 
          />
          
          <div className="text-center mt-4">
            <button 
              onClick={() => {
                setLoading(true);
                fetchGithubData();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Horoscope
            </button>
          </div>
        </>
      )}
    </main>
  );
} 