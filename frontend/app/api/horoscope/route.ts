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
  // Normalize data - but with more generous scaling for positive outcomes
  const normalizedData = {
    commits: Math.min(Math.max(data.commits || 0, 0), 1000),
    stars: Math.min(Math.max(data.stars || 0, 0), 1000),
    repos: Math.min(Math.max(data.repos || 0, 0), 100),
    followers: Math.min(Math.max(data.followers || 0, 0), 1000)
  };
  
  // More generous thresholds for scoring traits
  // Map GitHub stats to traits on a scale of 4-10 instead of 1-10
  // This ensures even low activity gets a positive score
  const energy = calculateTraitScore(normalizedData.commits, [0, 5, 10, 20, 40, 80, 150, 300, 500, 1000], 4);
  const charisma = calculateTraitScore(normalizedData.stars, [0, 1, 3, 8, 15, 30, 60, 120, 240, 500], 4);
  const creativity = calculateTraitScore(normalizedData.repos, [0, 1, 2, 4, 6, 10, 15, 25, 40, 80], 4);
  const collaboration = calculateTraitScore(normalizedData.followers, [0, 1, 3, 5, 10, 20, 40, 80, 160, 320], 4);
  
  // Calculate cosmic alignment - higher base score for positivity
  const cosmicAlignment = 50 + ((energy + charisma + creativity + collaboration) / 40) * 50;
  
  // Random positive traits to highlight
  const positiveTraits = [
    "creativity", "innovation", "persistence", "problem-solving", 
    "adaptability", "curiosity", "dedication", "focus", 
    "analytical thinking", "attention to detail", "consistency",
    "resourcefulness", "efficiency", "strategic planning"
  ];
  
  // Randomly select a few positive traits to mention
  const selectedTraits = getRandomElements(positiveTraits, 3);
  
  // Generate personalized messages based on traits - more positive and encouraging
  const messages = {
    energy: getEnergyMessage(energy, normalizedData.commits, selectedTraits[0]),
    charisma: getCharismaMessage(charisma, normalizedData.stars, selectedTraits[1]),
    creativity: getCreativityMessage(creativity, normalizedData.repos, selectedTraits[2]),
    collaboration: getCollaborationMessage(collaboration, normalizedData.followers),
    cosmic: getCosmicMessage(cosmicAlignment)
  };
  
  // Combine all messages
  const message = `${messages.energy} ${messages.charisma} ${messages.creativity} ${messages.collaboration} ${messages.cosmic}`;
  
  // Add growth potential message for lower stats
  const growthMessage = getGrowthMessage(energy, charisma, creativity, collaboration);
  
  const finalMessage = message + " " + growthMessage;
  
  return {
    date: new Date().toISOString().split('T')[0],
    traits: {
      energy,
      charisma,
      creativity,
      collaboration
    },
    message: finalMessage
  };
}

// Get random elements from an array
function getRandomElements(array: string[], count: number): string[] {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Calculate trait score based on thresholds (with minimum score)
function calculateTraitScore(value: number, thresholds: number[], minScore: number = 1): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) {
      return Math.max(i + 1, minScore);
    }
  }
  return 10;
}

// Get a motivational growth message based on overall score
function getGrowthMessage(energy: number, charisma: number, creativity: number, collaboration: number): string {
  const avgScore = (energy + charisma + creativity + collaboration) / 4;
  
  if (avgScore <= 5) {
    return "The cosmic code patterns reveal that you're at the beginning of an exciting coding journey. Every line of code you write is building your programming constellation and creating a strong foundation for your future impact in the tech universe.";
  } else if (avgScore <= 7) {
    return "The GitHub stars indicate you're in a growth phase with tremendous potential ahead. Your coding patterns show a promising trajectory, and continuing your momentum will lead to breakthrough contributions in the coming months.";
  } else {
    return "Your coding constellation is already impressive, and the tech stars indicate even greater achievements on your horizon. Your established patterns of excellence position you perfectly for your next major milestone.";
  }
}

// Energy messages based on commit activity - more positive and encouraging
function getEnergyMessage(score: number, commits: number, trait: string): string {
  if (score >= 8) {
    return `Your coding energy radiates with extraordinary power! Your ${commits} commits demonstrate remarkable ${trait} that inspires those around you. This is an excellent time to tackle challenging projects that showcase your talents.`;
  } else if (score >= 6) {
    return `Your coding energy flows with impressive consistency. Your ${commits} commits reveal your natural ${trait} and determined spirit. Focus on projects that leverage your unique strengths for maximum impact.`;
  } else if (score >= 4) {
    return `Your coding energy shows exciting potential! Even with ${commits} commits, your ${trait} shines through clearly. This is a perfect time to build momentum on projects you're passionate about.`;
  } else {
    return `Your coding energy is building up with tremendous potential! While you're just beginning with ${commits} commits, your ${trait} is already evident. This is an ideal moment to explore new coding adventures that spark your interest.`;
  }
}

// Charisma messages based on stars received - more positive and encouraging
function getCharismaMessage(score: number, stars: number, trait: string): string {
  if (score >= 8) {
    return `Your code's charisma magnetizes attention with ${stars} stars! Your work demonstrates exceptional ${trait} that resonates with the developer community. Share your insights boldly as they're likely to gain significant recognition.`;
  } else if (score >= 6) {
    return `Your code's charisma is developing beautifully with ${stars} stars. Your ${trait} adds a special quality to your work that others appreciate. Continue refining your documentation to amplify your growing influence.`;
  } else if (score >= 4) {
    return `Your code's charisma holds promising appeal with ${stars} stars. Your ${trait} gives your work a unique character that's beginning to attract attention. Each project you share strengthens your distinctive coding voice.`;
  } else {
    return `Your code's charisma journey is just beginning with ${stars} stars, but the potential is extraordinary! Your ${trait} will increasingly shine through as you share more of your work. Focus on projects that showcase your unique perspective.`;
  }
}

// Creativity messages based on repository variety - more positive and encouraging
function getCreativityMessage(score: number, repos: number, trait: string): string {
  if (score >= 8) {
    return `Your creative coding spirit flourishes exceptionally across ${repos} repositories! Your ${trait} enables you to approach problems with innovative solutions. Experiment boldly with new approaches to unlock even more of your vast potential.`;
  } else if (score >= 6) {
    return `Your creative coding vision expands wonderfully across ${repos} repositories. Your ${trait} allows you to see possibilities others might miss. Explore different programming paradigms to further enhance your growing repertoire.`;
  } else if (score >= 4) {
    return `Your creative coding insight develops beautifully through your ${repos} repositories. Your ${trait} gives you a special advantage when approaching new challenges. Consider exploring diverse project types to showcase your versatility.`;
  } else {
    return `Your creative coding foundation is forming brilliantly with ${repos} repositories. Even at this early stage, your ${trait} is already becoming apparent. This is the perfect time to experiment with different project types that interest you.`;
  }
}

// Collaboration messages based on follower count - more positive and encouraging
function getCollaborationMessage(score: number, followers: number): string {
  if (score >= 8) {
    return `Your collaborative alignment is exceptional with ${followers} followers! Your ability to connect with others creates powerful coding synergies. Lead discussions and contribute to community projects where your influence can have maximum impact.`;
  } else if (score >= 6) {
    return `Your collaborative network is flourishing beautifully with ${followers} followers. Your perspective adds valuable insights to team projects. Engage actively in code reviews to share your unique viewpoint and strengthen community bonds.`;
  } else if (score >= 4) {
    return `Your collaborative connections show promising growth with ${followers} followers. Your contributions create positive ripples throughout your network. Engage with open source communities to expand your influence and learning opportunities.`;
  } else {
    return `Your collaborative journey is at an exciting beginning stage with ${followers} followers. Every connection you make opens new possibilities for growth. Join developer communities where your fresh perspective will be especially valuable.`;
  }
}

// Cosmic alignment message based on overall score - more positive and encouraging
function getCosmicMessage(score: number): string {
  if (score >= 80) {
    return `The stars of technology are perfectly aligned for you at an impressive ${Math.round(score)}% cosmic alignment! Your coding horoscope reveals this is an extraordinary period for breakthroughs and recognition. Trust your instincts completely!`;
  } else if (score >= 60) {
    return `The technological cosmos strongly favors your development journey at ${Math.round(score)}% alignment! Your coding path is illuminated with promising opportunities. Trust your unique approach when architecting solutions.`;
  } else if (score >= 40) {
    return `The programming planets are aligning favorably at ${Math.round(score)}% harmony! This balanced cosmic state provides an excellent foundation for both creating and learning. Your next coding achievement is within reach.`;
  } else {
    return `The development stars reveal an exciting period of potential at ${Math.round(score)}% alignment! This is a powerful time to build foundations that will support your future coding accomplishments. Your unique path is just beginning to unfold.`;
  }
} 