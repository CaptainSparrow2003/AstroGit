import { NextResponse } from 'next/server';
import { GithubData } from '@/types/horoscope';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // Get the username from URL params
    const username = params.username;
    
    // Get GitHub token from environment variable
    const githubToken = process.env.GITHUB_TOKEN;
    
    // Create headers for GitHub API
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AstroGit-App'
    };
    
    // Add authorization if token is available
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    } else {
      console.warn('No GITHUB_TOKEN found in environment variables. Using unauthenticated requests (subject to rate limiting).');
    }
    
    // Fetch basic user data
    console.log(`Fetching GitHub user data for: ${username}`);
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`GitHub API error (${userResponse.status}):`, errorText);
      
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
    
    // Get events to calculate more accurate commit count
    console.log(`Fetching events for user: ${username}`);
    const eventsResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
    
    // Initialize GitHub data with values from user data
    const githubData: GithubData = {
      commits: 0,
      stars: 0,
      repos: userData.public_repos || 0,
      followers: userData.followers || 0
    };
    
    // Get additional data to enrich profile
    const additionalData = {
      following: userData.following || 0,
      created_at: userData.created_at,
      location: userData.location || null,
      company: userData.company || null,
      blog: userData.blog || null,
      bio: userData.bio || null,
      twitter_username: userData.twitter_username || null,
      public_gists: userData.public_gists || 0,
      account_age_days: Math.floor((new Date().getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))
    };
    
    // Count commits from events if available
    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      
      // Count push events and their commits
      let recentCommitCount = 0;
      
      events.forEach((event: any) => {
        if (event.type === 'PushEvent' && event.payload && event.payload.commits) {
          recentCommitCount += event.payload.commits.length;
        }
      });
      
      console.log(`Found ${recentCommitCount} recent commits from events`);
      
      // Use recent commits as a base, but we'll still fetch repos for stars and to estimate total commits better
      githubData.commits = recentCommitCount;
    }
    
    // Fetch repositories to calculate stars and languages
    console.log(`Fetching repositories for user: ${username}`);
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
    
    const languageStats: Record<string, number> = {};
    
    if (reposResponse.ok) {
      const repos = await reposResponse.json();
      console.log(`Found ${repos.length} repositories for user: ${username}`);
      
      // Calculate total stars
      githubData.stars = repos.reduce((total: number, repo: any) => total + (repo.stargazers_count || 0), 0);
      
      // Collect language data
      for (const repo of repos.slice(0, 10)) {
        if (repo.language) {
          // If the repo already has a language field, use it
          languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
        } else if (repo.languages_url) {
          // Otherwise try to fetch languages
          try {
            const langResponse = await fetch(repo.languages_url, { headers });
            if (langResponse.ok) {
              const languages = await langResponse.json();
              Object.keys(languages).forEach(lang => {
                languageStats[lang] = (languageStats[lang] || 0) + 1;
              });
            }
          } catch (error) {
            console.error(`Error fetching languages for ${repo.name}:`, error);
          }
        }
      }
      
      // If event-based commit count is too low, estimate using repositories
      if (githubData.commits < 10 && repos.length > 0) {
        // For commits, we'll check a sample of repositories
        const reposToCheck = repos.slice(0, 5);
        let totalCommits = githubData.commits; // Start with what we have
        
        for (const repo of reposToCheck) {
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
        }
        
        // If we have commit data, use it
        if (totalCommits > 0) {
          // Scale up the commit count since we only checked a few repos
          const commitMultiplier = Math.max(1, repos.length / reposToCheck.length);
          githubData.commits = Math.round(totalCommits * commitMultiplier);
          console.log(`Estimated total commits: ${githubData.commits}`);
        }
      }
      
      // If we still don't have good commit data, use a reasonable estimate
      if (githubData.commits < 10) {
        // Fallback to a reasonable estimate based on repos and account age
        const accountAgeInDays = additionalData.account_age_days;
        const commitEstimate = Math.floor((accountAgeInDays / 30) * repos.length * 2);
        githubData.commits = Math.max(commitEstimate, 10); // Ensure at least 10 commits
        console.log(`Using fallback commit estimate: ${githubData.commits}`);
      }
    } else {
      console.log(`Could not fetch repositories: ${reposResponse.status}`);
    }
    
    // Sort languages by usage count
    const sortedLanguages = Object.entries(languageStats)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, number>);
    
    // Return both the user data, calculated GitHub stats, and additional profile info
    return NextResponse.json({
      ...userData,
      githubStats: githubData,
      additionalData: {
        ...additionalData,
        languages: sortedLanguages
      }
    });
  } catch (error) {
    console.error('Error in GitHub user API:', error);
    
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 