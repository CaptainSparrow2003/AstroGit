#!/usr/bin/env node

/**
 * Auth Configuration Checker
 * 
 * This script checks if the required environment variables for NextAuth
 * are properly set up in the .env.local file.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('🔍 Checking NextAuth configuration...\n');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let envConfig;

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ Found .env.local file');
    envConfig = dotenv.parse(fs.readFileSync(envPath));
  } else {
    console.log('❌ .env.local file not found!');
    envConfig = {};
  }
} catch (error) {
  console.error('Error reading .env.local file:', error);
  process.exit(1);
}

// Check required environment variables
const requiredVars = [
  { name: 'NEXTAUTH_URL', description: 'The URL of your site (for callbacks)' },
  { name: 'NEXTAUTH_SECRET', description: 'Secret used to encrypt tokens' },
  { name: 'GITHUB_CLIENT_ID', description: 'GitHub OAuth App Client ID' },
  { name: 'GITHUB_CLIENT_SECRET', description: 'GitHub OAuth App Client Secret' }
];

let missingVars = 0;

console.log('\n📋 Environment Variables Check:');
console.log('--------------------------------');

requiredVars.forEach(variable => {
  const value = envConfig[variable.name] || process.env[variable.name];
  
  if (!value) {
    console.log(`❌ ${variable.name}: MISSING - ${variable.description}`);
    missingVars++;
  } else {
    // Don't show the actual value for secrets
    const displayValue = variable.name.includes('SECRET') 
      ? '********' 
      : value;
    console.log(`✅ ${variable.name}: ${displayValue}`);
  }
});

console.log('--------------------------------');

if (missingVars > 0) {
  console.log(`\n❌ Found ${missingVars} missing environment variables!`);
  console.log('\n🛠️ Fix instructions:');
  console.log('1. Create or edit .env.local in the project root');
  console.log('2. Add the missing variables listed above');
  console.log('3. Restart your Next.js development server');
  
  if (!envConfig.NEXTAUTH_URL) {
    console.log('\n💡 For NEXTAUTH_URL, use:');
    console.log('   • Development: http://localhost:3000');
    console.log('   • Production: https://your-domain.com');
  }
  
  if (!envConfig.NEXTAUTH_SECRET) {
    console.log('\n💡 For NEXTAUTH_SECRET, generate a secure random string:');
    console.log('   • Run: openssl rand -base64 32');
    console.log('   • Or use a password generator');
  }
  
  if (!envConfig.GITHUB_CLIENT_ID || !envConfig.GITHUB_CLIENT_SECRET) {
    console.log('\n💡 For GitHub OAuth credentials:');
    console.log('   1. Go to: https://github.com/settings/developers');
    console.log('   2. Create a new OAuth App or select an existing one');
    console.log('   3. Set the Authorization callback URL to:');
    console.log('      http://localhost:3000/api/auth/callback/github (development)');
    console.log('   4. Copy the Client ID and Client Secret to your .env.local file');
  }
} else {
  console.log('\n✅ All required environment variables are set!');
}

// Check for callback URL configuration if GitHub credentials exist
if (envConfig.GITHUB_CLIENT_ID && envConfig.GITHUB_CLIENT_SECRET && envConfig.NEXTAUTH_URL) {
  console.log('\n🔄 Checking OAuth callback URL configuration...');
  
  const callbackUrl = new URL('/api/auth/callback/github', envConfig.NEXTAUTH_URL).toString();
  console.log(`📎 Your GitHub callback URL should be: ${callbackUrl}`);
  console.log('   Verify this matches the callback URL in your GitHub OAuth app settings');
}

console.log('\n📚 For more help with NextAuth.js setup, visit:');
console.log('   https://next-auth.js.org/getting-started/example');
console.log('\n🚀 After fixing any issues, restart your Next.js server\n'); 