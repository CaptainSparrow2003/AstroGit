#!/usr/bin/env node

/**
 * Auth Configuration Fixer
 * 
 * This script automatically fixes common authentication issues:
 * 1. Creates/updates .env.local with required variables
 * 2. Generates a secure random NEXTAUTH_SECRET if missing
 * 3. Sets NEXTAUTH_URL to the correct development URL
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

console.log('🔧 AstroGit Auth Configuration Fixer\n');

// File paths
const envPath = path.resolve(process.cwd(), '.env.local');

// Generate secure random string for NEXTAUTH_SECRET
function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Load existing env vars or create empty object
let envVars = {};
if (fs.existsSync(envPath)) {
  console.log('📁 Found existing .env.local file');
  envVars = dotenv.parse(fs.readFileSync(envPath));
} else {
  console.log('📁 Creating new .env.local file');
}

// Set NEXTAUTH_URL if missing or incorrect
if (!envVars.NEXTAUTH_URL || !envVars.NEXTAUTH_URL.includes('localhost:3000')) {
  envVars.NEXTAUTH_URL = 'http://localhost:3000';
  console.log('✅ Set NEXTAUTH_URL to http://localhost:3000');
}

// Generate NEXTAUTH_SECRET if missing
if (!envVars.NEXTAUTH_SECRET) {
  envVars.NEXTAUTH_SECRET = generateSecret();
  console.log('✅ Generated new secure NEXTAUTH_SECRET');
}

// Check GitHub credentials
let needsGitHubCredentials = false;
if (!envVars.GITHUB_CLIENT_ID || !envVars.GITHUB_CLIENT_SECRET) {
  needsGitHubCredentials = true;
  console.log('⚠️ GitHub OAuth credentials are missing');
  
  // Add placeholder values for now
  if (!envVars.GITHUB_CLIENT_ID) {
    envVars.GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID';
  }
  
  if (!envVars.GITHUB_CLIENT_SECRET) {
    envVars.GITHUB_CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET';
  }
}

// Write the updated .env.local file
const envContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(envPath, envContent);
console.log('💾 Updated .env.local file with required variables');

// Instructions for GitHub OAuth setup if needed
if (needsGitHubCredentials) {
  console.log('\n⭐ GitHub OAuth Setup Instructions:');
  console.log('1. Go to https://github.com/settings/developers');
  console.log('2. Click "New OAuth App" or select an existing app');
  console.log('3. Set the following values:');
  console.log('   - Application name: AstroGit (or any name you prefer)');
  console.log('   - Homepage URL: http://localhost:3000');
  console.log('   - Authorization callback URL: http://localhost:3000/api/auth/callback/github');
  console.log('4. Click "Register application"');
  console.log('5. Copy the Client ID and Client Secret');
  console.log('6. Update your .env.local file with these values');
}

// Final instructions
console.log('\n🚀 Next steps:');
console.log('1. Restart your Next.js development server');
if (needsGitHubCredentials) {
  console.log('2. Complete the GitHub OAuth setup above');
}
console.log('\n✨ Auth configuration fix complete!'); 