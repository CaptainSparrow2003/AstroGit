#!/usr/bin/env node

// Script to fix common NextAuth authentication issues
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const https = require('https');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a secure random string
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

// Ask for user input with a default value
function askQuestion(question, defaultValue) {
  return new Promise((resolve) => {
    const defaultText = defaultValue ? ` (default: ${defaultValue})` : '';
    rl.question(`${question}${defaultText}: `, (answer) => {
      resolve(answer || defaultValue || '');
    });
  });
}

// Check if a URL is reachable
function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      resolve({
        status: res.statusCode,
        reachable: res.statusCode >= 200 && res.statusCode < 400
      });
    });
    
    req.on('error', () => {
      resolve({ status: 'error', reachable: false });
    });
    
    req.end();
  });
}

// Main function
async function fixAuth() {
  console.log('\n🔧 AstroGit Auth Troubleshooter 🔧\n');
  console.log('This script will help fix common authentication issues.\n');
  
  const envPath = path.resolve(process.cwd(), '.env.local');
  let existingEnv = {};
  let envContent = '';
  
  // Step 1: Check if .env.local exists and load it
  console.log('Step 1: Checking environment variables...');
  if (fs.existsSync(envPath)) {
    console.log('✅ Found .env.local file');
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse existing values
    envContent.split('\n').forEach(line => {
      const matches = line.match(/^([^=:#]+?)[=:](.*)$/);
      if (matches && matches.length > 2) {
        const key = matches[1].trim();
        let value = matches[2].trim();
        
        // Remove quotes if they exist
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        
        existingEnv[key] = value;
      }
    });
  } else {
    console.log('⚠️ No .env.local file found. Will create one.');
  }
  
  // Step 2: Check NEXTAUTH_URL
  console.log('\nStep 2: Checking NEXTAUTH_URL...');
  const defaultUrl = existingEnv.NEXTAUTH_URL || 'http://localhost:3000';
  const nextauthUrl = await askQuestion('Enter your NextAuth URL', defaultUrl);
  
  // Check if URL is reachable
  console.log(`Checking if ${nextauthUrl} is reachable...`);
  const urlCheck = await checkUrl(nextauthUrl);
  if (urlCheck.reachable) {
    console.log(`✅ URL is reachable (status: ${urlCheck.status})`);
  } else {
    console.log(`⚠️ URL is not reachable (status: ${urlCheck.status}). Make sure your server is running.`);
  }
  
  // Step 3: Check NEXTAUTH_SECRET
  console.log('\nStep 3: Checking NEXTAUTH_SECRET...');
  let nextauthSecret = existingEnv.NEXTAUTH_SECRET;
  if (!nextauthSecret || nextauthSecret === 'your_nextauth_secret') {
    console.log('⚠️ NEXTAUTH_SECRET is missing or using a placeholder value');
    const generateNew = await askQuestion('Generate a new secure secret? (y/n)', 'y');
    if (generateNew.toLowerCase() === 'y' || generateNew.toLowerCase() === 'yes') {
      nextauthSecret = generateSecret();
      console.log('✅ Generated new NEXTAUTH_SECRET');
    } else {
      nextauthSecret = await askQuestion('Enter your NEXTAUTH_SECRET', '');
      if (!nextauthSecret) {
        console.log('⚠️ Warning: NEXTAUTH_SECRET is empty. Authentication may not work properly.');
      }
    }
  } else {
    console.log('✅ NEXTAUTH_SECRET is set');
  }
  
  // Step 4: Check GitHub OAuth credentials
  console.log('\nStep 4: Checking GitHub OAuth credentials...');
  const githubClientId = await askQuestion('Enter your GitHub Client ID', existingEnv.GITHUB_CLIENT_ID || '');
  const githubClientSecret = await askQuestion('Enter your GitHub Client Secret', existingEnv.GITHUB_CLIENT_SECRET || '');
  
  if (!githubClientId || !githubClientSecret) {
    console.log('⚠️ Warning: GitHub credentials are missing. Authentication will not work.');
  } else {
    console.log('✅ GitHub credentials are set');
  }
  
  // Step 5: Check API URL
  console.log('\nStep 5: Checking API URL...');
  const apiUrl = await askQuestion('Enter your API URL', existingEnv.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  
  // Check if API URL is reachable
  console.log(`Checking if ${apiUrl} is reachable...`);
  const apiCheck = await checkUrl(apiUrl);
  if (apiCheck.reachable) {
    console.log(`✅ API URL is reachable (status: ${apiCheck.status})`);
  } else {
    console.log(`⚠️ API URL is not reachable (status: ${apiCheck.status}). Make sure your API server is running.`);
  }
  
  // Step 6: Create/update .env.local
  console.log('\nStep 6: Updating .env.local file...');
  const newEnv = {
    NEXTAUTH_URL: nextauthUrl,
    NEXTAUTH_SECRET: nextauthSecret,
    GITHUB_CLIENT_ID: githubClientId,
    GITHUB_CLIENT_SECRET: githubClientSecret,
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_URL: existingEnv.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: existingEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };
  
  let newEnvContent = '';
  for (const [key, value] of Object.entries(newEnv)) {
    if (value) {
      newEnvContent += `${key}=${value}\n`;
    }
  }
  
  try {
    fs.writeFileSync(envPath, newEnvContent);
    console.log(`✅ Successfully updated ${envPath}`);
  } catch (error) {
    console.error(`❌ Error writing to ${envPath}: ${error.message}`);
    console.log('\nHere is the content you should manually add to your .env.local file:');
    console.log('\n' + newEnvContent);
  }
  
  // Step 7: Check GitHub callback URL
  console.log('\nStep 7: Verifying GitHub callback URL...');
  const callbackUrl = `${nextauthUrl}/api/auth/callback/github`;
  console.log(`\nMake sure your GitHub OAuth app has this exact callback URL configured:`);
  console.log(`👉 ${callbackUrl}`);
  
  console.log('\n📋 Next steps:');
  console.log('1. Restart your Next.js server: npm run dev');
  console.log('2. Try signing in with GitHub again');
  console.log('3. If issues persist, check the browser console and server logs for errors');
  console.log('\nGood luck! 🚀\n');
  
  rl.close();
}

// Run the script
fixAuth().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 