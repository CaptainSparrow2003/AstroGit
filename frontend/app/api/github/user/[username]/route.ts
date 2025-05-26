import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/utils/auth';
import { GithubData } from '@/types/horoscope';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // Get the username from URL params
    const username = params.username;
    
    // Get the current session to access GitHub token
    const session = await getServerSession(authOptions);
    
    // Log session info for debugging
    console.log('GitHub API Session:', {
      hasSession: !!session,
      hasAccessToken: !!(session?.accessToken),
      username: username
    });
    
    // Create base headers
    let headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AstroGit-App'
    };
    
    // Add authorization header if we have an access token
    if (session?.accessToken) {
      console.log('Using access token from session for GitHub API');
      headers['Authorization'] = `token ${session.accessToken}`;
    } else {
      console.log('No access token available, making unauthenticated request to GitHub API');
    }
    
    // Fetch basic user data
    console.log(`Fetching GitHub user data for: ${username}`);
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`GitHub API error (${userResponse.status}):`, errorText);
      
      // If unauthorized, the token might be invalid
      if (userResponse.status === 401) {
        return NextResponse.json(
          { error: 'GitHub API authorization failed. Please sign out and sign in again.' },
          { status: 401 }
        );
      }
      
      // If not found, the username might be incorrect
      if (userResponse.status === 404) {
        return NextResponse.json(
          { error: `GitHub user '${username}' not found` },
          { status: 404 }
        );
      }
      
      // For other errors, return a generic message with the status
      return NextResponse.json(
        { error: `GitHub API error: ${userResponse.status}` },
        { status: userResponse.status }
      );
    }
    
    const userData = await userResponse.json();
    console.log(`Successfully fetched data for user: ${userData.login}`);
    
    // Initialize GitHub data with values from user data
    const githubData: GithubData = {
      commits: 0,
      stars: 0,
      repos: userData.public_repos || 0,
      followers: userData.followers || 0
    };
    
    // Fetch repositories to calculate stars
    console.log(`Fetching repositories for user: ${username}`);
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
    
    if (reposResponse.ok) {
      const repos = await reposResponse.json();
      console.log(`Found ${repos.length} repositories for user: ${username}`);
      
      // Calculate total stars
      githubData.stars = repos.reduce((total: number, repo: any) => total + (repo.stargazers_count || 0), 0);
      
      // For commits, we'll need to check each repository
      // To avoid rate limiting, we'll check only the first 5 repos
      if (repos.length > 0) {
        console.log(`Fetching commit data from ${Math.min(repos.length, 5)} repositories`);
        
        // Fetch commit counts for each repository (limited to first 5 repos to avoid rate limiting)
        const reposToCheck = repos.slice(0, 5);
        let totalCommits = 0;
        
        // Use Promise.all to fetch commits in parallel
        await Promise.all(reposToCheck.map(async (repo: any) => {
          try {
            // We need to specify the author in the query to only count this user's commits
            const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&per_page=1`;
            const commitResponse = await fetch(commitsUrl, { headers });
            
            if (commitResponse.ok) {
              // GitHub provides the total count in the Link header for pagination
              const linkHeader = commitResponse.headers.get('Link');
              if (linkHeader && linkHeader.includes('rel="last"')) {
                // Extract the total page count from the Link header
                const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                if (match && match[1]) {
                  const commitCount = parseInt(match[1], 10);
                  totalCommits += commitCount;
                  console.log(`Found ${commitCount} commits in ${repo.name}`);
                }
              } else {
                // If no Link header with "last" relation, count the commits manually
                const commits = await commitResponse.json();
                totalCommits += commits.length;
                console.log(`Found ${commits.length} commits in ${repo.name}`);
              }
            } else {
              console.log(`Could not fetch commits for ${repo.name}: ${commitResponse.status}`);
            }
          } catch (error) {
            console.error(`Error fetching commits for ${repo.full_name}:`, error);
          }
        }));
        
        // If we have commit data, use it
        if (totalCommits > 0) {
          // Scale up the commit count since we only checked a few repos
          const commitMultiplier = Math.max(1, repos.length / reposToCheck.length);
          githubData.commits = Math.round(totalCommits * commitMultiplier);
          console.log(`Estimated total commits: ${githubData.commits}`);
        } else {
          // Fallback to a reasonable estimate based on repos and account age
          const accountAgeInDays = Math.floor((new Date().getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24));
          githubData.commits = Math.floor((accountAgeInDays / 30) * repos.length * 2);
          console.log(`Using fallback commit estimate: ${githubData.commits}`);
        }
      }
    } else {
      console.log(`Could not fetch repositories: ${reposResponse.status}`);
    }
    
    // Return both the user data and the calculated GitHub stats
    return NextResponse.json({
      ...userData,
      githubStats: githubData
    });
  } catch (error) {
    console.error('Error in GitHub user API:', error);
    
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 