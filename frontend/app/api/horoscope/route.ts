import { NextResponse } from 'next/server';
import { GithubData, Horoscope } from '@/types/horoscope';

export async function POST(request: Request) {
  try {
    const { userId, githubData } = await request.json();
    
    if (!githubData) {
      return NextResponse.json(
        { error: 'GitHub data is required' },
        { status: 400 }
      );
    }
    
    // Generate a horoscope based on the GitHub data
    const horoscope = generateHoroscope(githubData);
    
    // Log the generated horoscope
    console.log(`Generated horoscope for user ${userId}`);
    
    return NextResponse.json(horoscope);
  } catch (error) {
    console.error('Error generating horoscope:', error);
    return NextResponse.json(
      { error: 'Failed to generate horoscope' },
      { status: 500 }
    );
  }
}

function generateHoroscope(data: GithubData): Horoscope {
  // Normalize data - especially important now that we're using real values
  const normalizedData = {
    commits: Math.min(Math.max(data.commits || 0, 0), 1000),
    stars: Math.min(Math.max(data.stars || 0, 0), 1000),
    repos: Math.min(Math.max(data.repos || 0, 0), 100),
    followers: Math.min(Math.max(data.followers || 0, 0), 1000)
  };
  
  // Map GitHub stats to traits on a scale of 1-10
  const energy = calculateTraitScore(normalizedData.commits, [0, 10, 50, 100, 200, 300, 400, 500, 700, 1000]);
  const charisma = calculateTraitScore(normalizedData.stars, [0, 5, 10, 20, 50, 100, 200, 300, 500, 1000]);
  const creativity = calculateTraitScore(normalizedData.repos, [0, 2, 5, 10, 15, 20, 30, 40, 50, 100]);
  const collaboration = calculateTraitScore(normalizedData.followers, [0, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);
  
  // Calculate an overall cosmic alignment score (0-100)
  const cosmicAlignment = ((energy + charisma + creativity + collaboration) / 40) * 100;
  
  // Generate personalized messages based on traits
  const messages = {
    energy: getEnergyMessage(energy, normalizedData.commits),
    charisma: getCharismaMessage(charisma, normalizedData.stars),
    creativity: getCreativityMessage(creativity, normalizedData.repos),
    collaboration: getCollaborationMessage(collaboration, normalizedData.followers),
    cosmic: getCosmicMessage(cosmicAlignment)
  };
  
  // Combine all messages
  const message = `${messages.energy} ${messages.charisma} ${messages.creativity} ${messages.collaboration} ${messages.cosmic}`;
  
  return {
    date: new Date().toISOString().split('T')[0],
    traits: {
      energy,
      charisma,
      creativity,
      collaboration
    },
    message
  };
}

// Calculate trait score based on thresholds (1-10 scale)
function calculateTraitScore(value: number, thresholds: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) {
      return i + 1;
    }
  }
  return 10;
}

// Energy messages based on commit activity
function getEnergyMessage(score: number, commits: number): string {
  if (score >= 8) {
    return `Your coding energy is extraordinary with ${commits} commits! This is an excellent time to tackle challenging projects or learn new technologies.`;
  } else if (score >= 5) {
    return `Your coding energy is steady and reliable with ${commits} commits. Focus on maintaining consistent progress on your current projects.`;
  } else if (score >= 3) {
    return `Your coding energy is moderate with ${commits} commits. Consider setting small, achievable goals to build momentum.`;
  } else {
    return `Your coding energy is building up with ${commits} commits. This is a great time for planning and researching your next coding adventure.`;
  }
}

// Charisma messages based on stars received
function getCharismaMessage(score: number, stars: number): string {
  if (score >= 8) {
    return `Your code's charisma is magnetic with ${stars} stars! Share your work publicly as it's likely to attract positive attention.`;
  } else if (score >= 5) {
    return `Your code's charisma is developing well with ${stars} stars. Continue refining your documentation and presentation.`;
  } else if (score >= 3) {
    return `Your code's charisma has potential with ${stars} stars. Consider adding more documentation and examples to showcase your work.`;
  } else {
    return `Your code's charisma journey is just beginning with ${stars} stars. Focus on creating value in your projects that others can benefit from.`;
  }
}

// Creativity messages based on repository variety
function getCreativityMessage(score: number, repos: number): string {
  if (score >= 8) {
    return `Your creative coding spirit is exceptionally high with ${repos} repositories. Experiment with new approaches to solve technical challenges.`;
  } else if (score >= 5) {
    return `Your creative coding potential is showing promise across ${repos} repositories. Try exploring different programming paradigms or libraries.`;
  } else if (score >= 3) {
    return `Your creative coding insight is developing through your ${repos} repositories. Consider branching out into new project types.`;
  } else {
    return `Your creative coding foundation is forming with ${repos} repositories. This is a perfect time to explore diverse coding interests.`;
  }
}

// Collaboration messages based on follower count
function getCollaborationMessage(score: number, followers: number): string {
  if (score >= 8) {
    return `Your collaborative alignment is outstanding with ${followers} followers. Lead discussions and contribute to community projects for maximum impact.`;
  } else if (score >= 5) {
    return `Your collaborative alignment is harmonious with ${followers} followers. Participate in code reviews and team discussions to share your perspective.`;
  } else if (score >= 3) {
    return `Your collaborative network is growing with ${followers} followers. Engage with open source communities to expand your connections.`;
  } else {
    return `Your collaborative journey is at an early stage with ${followers} followers. This is a great time to join developer communities and start contributing to discussions.`;
  }
}

// Cosmic alignment message based on overall score
function getCosmicMessage(score: number): string {
  if (score >= 80) {
    return `The stars of technology are perfectly aligned for you at ${Math.round(score)}% cosmic alignment. Your coding horoscope suggests this is an exceptional time for breakthroughs!`;
  } else if (score >= 60) {
    return `The technological cosmos favors your development journey at ${Math.round(score)}% alignment. Trust your instincts when architecting solutions.`;
  } else if (score >= 40) {
    return `The programming planets are in a neutral alignment at ${Math.round(score)}%. Balance coding with learning for optimal growth.`;
  } else {
    return `The development stars suggest a period of preparation at ${Math.round(score)}% alignment. Use this time to sharpen your fundamental skills.`;
  }
} 