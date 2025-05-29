require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Octokit } = require('octokit');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AstroGit API' });
});

// GitHub Routes
app.get('/api/github/user/:username', async (req, res) => {
  try {
    const octokit = new Octokit();
    const { username } = req.params;
    
    const response = await octokit.request('GET /users/{username}', {
      username,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub user data' });
  }
});

// Horoscope Generator
const generateHoroscope = (data) => {
  // Map GitHub stats to astrological traits
  const energy = mapCommitsToEnergy(data.commits || 0);
  const charisma = mapStarsToCharisma(data.stars || 0);
  const creativity = mapReposToCreativity(data.repos || 0);
  const collaboration = mapFollowersToCollaboration(data.followers || 0);
  
  // Generate personalized message based on traits
  const message = generatePersonalizedMessage(energy, charisma, creativity, collaboration);
  
  return {
    date: new Date().toISOString().split('T')[0],
    traits: { energy, charisma, creativity, collaboration },
    message
  };
};

// Helper functions for trait mapping
function mapCommitsToEnergy(commits) {
  if (commits > 500) return 10;
  return Math.min(Math.ceil(commits / 50), 10);
}

function mapStarsToCharisma(stars) {
  if (stars > 1000) return 10;
  return Math.min(Math.ceil(stars / 100), 10);
}

function mapReposToCreativity(repos) {
  if (repos > 50) return 10;
  return Math.min(Math.ceil(repos / 5), 10);
}

function mapFollowersToCollaboration(followers) {
  if (followers > 500) return 10;
  return Math.min(Math.ceil(followers / 50), 10);
}

function generatePersonalizedMessage(energy, charisma, creativity, collaboration) {
  const messages = [
    `Your coding energy is running ${energy > 7 ? 'extremely high' : energy > 4 ? 'steady' : 'a bit low'}. ${energy > 7 ? 'Great time to tackle challenging projects!' : energy > 4 ? 'Focus on manageable tasks.' : 'Consider taking a short break to recharge.'}`,
    `Your code's charisma is ${charisma > 7 ? 'dazzling others' : charisma > 4 ? 'getting attention' : 'waiting to be discovered'}. ${charisma > 7 ? 'Your work is inspiring the community!' : charisma > 4 ? 'Keep sharing your insights.' : 'Consider contributing to open-source projects.'}`,
    `Your creative coding spirit is ${creativity > 7 ? 'flourishing' : creativity > 4 ? 'showing potential' : 'seeking new directions'}. ${creativity > 7 ? 'Explore experimental features!' : creativity > 4 ? 'Try a new programming paradigm.' : 'Look for inspiration in other projects.'}`,
    `Your collaborative alignment is ${collaboration > 7 ? 'stellar' : collaboration > 4 ? 'harmonious' : 'developing'}. ${collaboration > 7 ? 'Lead a community initiative!' : collaboration > 4 ? 'Join more group discussions.' : 'Reach out to fellow developers for feedback.'}`
  ];
  
  return messages.join(' ');
}

// Generate horoscope endpoint
app.post('/api/horoscope', async (req, res) => {
  try {
    const { userId, githubData } = req.body;
    
    if (!githubData) {
      return res.status(400).json({ error: 'Missing required data' });
    }
    
    const horoscope = generateHoroscope(githubData);
    
    // Log the generated horoscope for the user (no DB storage)
    console.log(`Generated horoscope for user: ${userId || 'anonymous'}`);
    
    res.json(horoscope);
  } catch (error) {
    console.error('Error generating horoscope:', error);
    res.status(500).json({ error: 'Failed to generate horoscope' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 