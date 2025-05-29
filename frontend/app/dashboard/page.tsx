export const dynamic = "force-dynamic";

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import HoroscopeCard from '@/components/HoroscopeCard';
import { GithubData, Horoscope } from '@/types/horoscope';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  
  const [loading, setLoading] = useState(true);
  const [githubData, setGithubData] = useState<GithubData | null>(null);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [additionalData, setAdditionalData] = useState<any | null>(null);

  useEffect(() => {
    if (!username) {
      router.push('/');
      return;
    }
    
    fetchGithubData();
  }, [username, router]);

  useEffect(() => {
    if (githubData) {
      generateHoroscope();
    }
  }, [githubData]);

  const fetchGithubData = async () => {
    setLoading(true);
    try {
      console.log('Fetching GitHub data for user:', username);
      
      const response = await fetch(`/api/github/user/${username}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error ${response.status}:`, errorText);
        throw new Error(`Failed to fetch GitHub data: ${response.status} ${errorText}`);
      }
      
      const userData = await response.json();
      console.log('GitHub user data received:', userData);
      setUserData(userData);
      
      // Store additional data separately
      if (userData.additionalData) {
        setAdditionalData(userData.additionalData);
      }
      
      // Use the stats returned from our API - these are actual values
      if (userData.githubStats) {
        setGithubData(userData.githubStats);
      } else {
        // Fallback to extracted values from the user data
        setGithubData({
          commits: 0, // We can't easily get this from basic user data
          stars: 0, // Same for stars
          repos: userData.public_repos || 0,
          followers: userData.followers || 0
        });
      }
    } catch (err) {
      console.error('Error fetching GitHub data:', err);
      setError(`Failed to fetch GitHub data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Provide fallback data even if the API request fails
      setGithubData({
        commits: 50,
        stars: 20,
        repos: 5,
        followers: 10
      });
    } finally {
      setLoading(false);
    }
  };

  const generateHoroscope = async () => {
    if (!githubData) return;
    
    try {
      const response = await fetch('/api/horoscope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: username || 'demo-user',
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
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
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Coding Horoscope</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Back to Home
        </button>
      </div>
      
      {error ? (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-md mb-6 w-full max-w-3xl">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <div className="mt-2">
            <button 
              onClick={() => {
                setError(null);
                fetchGithubData();
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-2"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : null}
      
      {userData && (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 w-full max-w-5xl bg-black bg-opacity-40 p-6 rounded-lg border border-gray-700">
          <div className="flex flex-col items-center">
            {userData.avatar_url && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-purple-500">
                <Image 
                  src={userData.avatar_url} 
                  alt={userData.login || 'GitHub User'} 
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h2 className="text-2xl font-semibold">{userData.login || username}</h2>
            {userData.name && userData.name !== userData.login && (
              <p className="text-xl text-gray-300 mt-1">{userData.name}</p>
            )}
            
            <div className="mt-3 flex items-center">
              <Link 
                href={`https://github.com/${userData.login}`} 
                target="_blank"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                Visit GitHub Profile
              </Link>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            {additionalData?.bio && (
              <div className="mb-4">
                <p className="text-gray-300 italic">{additionalData.bio}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {additionalData?.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{additionalData.location}</span>
                </div>
              )}
              
              {additionalData?.company && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{additionalData.company}</span>
                </div>
              )}
              
              {additionalData?.blog && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a href={additionalData.blog.startsWith('http') ? additionalData.blog : `https://${additionalData.blog}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-400 hover:text-blue-300">
                    {additionalData.blog}
                  </a>
                </div>
              )}
              
              {additionalData?.twitter_username && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  <a href={`https://twitter.com/${additionalData.twitter_username}`}
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-400 hover:text-blue-300">
                    @{additionalData.twitter_username}
                  </a>
                </div>
              )}
              
              {additionalData?.created_at && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Joined {formatDate(additionalData.created_at)}</span>
                </div>
              )}
              
              {additionalData?.account_age_days && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{additionalData.account_age_days} days on GitHub</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-3xl">
        <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
          <h3 className="text-lg mb-1">Commits</h3>
          <p className="text-2xl font-bold">{githubData?.commits || 0}</p>
        </div>
        <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
          <h3 className="text-lg mb-1">Stars</h3>
          <p className="text-2xl font-bold">{githubData?.stars || 0}</p>
        </div>
        <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
          <h3 className="text-lg mb-1">Repos</h3>
          <p className="text-2xl font-bold">{githubData?.repos || 0}</p>
        </div>
        <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
          <h3 className="text-lg mb-1">Followers</h3>
          <p className="text-2xl font-bold">{githubData?.followers || 0}</p>
        </div>
      </div>

      {additionalData?.languages && Object.keys(additionalData.languages).length > 0 && (
        <div className="w-full max-w-3xl mb-8">
          <h3 className="text-xl font-semibold mb-3">Top Languages</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(additionalData.languages).slice(0, 8).map(([language, count]: [string, any]) => (
              <div key={language} className="bg-black bg-opacity-30 p-3 rounded-lg border border-gray-700 text-center">
                <span className="text-lg font-medium">{language}</span>
                <div className="text-sm text-gray-400">{count} {count === 1 ? 'repo' : 'repos'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {additionalData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-3xl">
          <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg mb-1">Following</h3>
            <p className="text-2xl font-bold">{additionalData.following || 0}</p>
          </div>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg mb-1">Gists</h3>
            <p className="text-2xl font-bold">{additionalData.public_gists || 0}</p>
          </div>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 text-center col-span-2">
            <h3 className="text-lg mb-1">Account Age</h3>
            <p className="text-xl font-bold">{additionalData.account_age_days} days</p>
          </div>
        </div>
      )}

      {horoscope ? (
        <>
          <HoroscopeCard 
            horoscope={horoscope} 
            username={userData?.login || username || 'Developer'} 
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
      ) : (
        <div className="text-center p-10">
          <p className="text-xl mb-4">No horoscope generated yet</p>
          <button
            onClick={generateHoroscope}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Horoscope
          </button>
        </div>
      )}
    </main>
  );
} 