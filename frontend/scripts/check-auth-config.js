#!/usr/bin/env node

/**
 * Auth Configuration Checker
 * 
 * This script checks the auth configuration and provides guidance on fixing common issues.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

// Print colored message
function print(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Print header
function printHeader(message) {
  console.log('\n' + colors.bold + colors.cyan + message + colors.reset);
  console.log('='.repeat(message.length));
}

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Get environment variables from .env.local
function getEnvVars() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fileExists(envPath)) {
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

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
      
      envVars[key] = value;
    }
  });

  return envVars;
}

// Main function
async function checkAuthConfig() {
  printHeader('AstroGit Auth Configuration Checker');
  
  // Check if .env.local exists
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fileExists(envPath)) {
    print('red', '❌ .env.local file not found!');
    print('yellow', 'Create a .env.local file with the following variables:');
    print('white', `
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
    `);
    return;
  }

  print('green', '✅ .env.local file found');
  
  // Check environment variables
  const envVars = getEnvVars();
  if (!envVars) {
    print('red', '❌ Failed to parse .env.local file');
    return;
  }

  printHeader('Environment Variables Check');
  
  // Check NEXTAUTH_URL
  if (!envVars.NEXTAUTH_URL) {
    print('red', '❌ NEXTAUTH_URL is missing');
  } else {
    print('green', `✅ NEXTAUTH_URL: ${envVars.NEXTAUTH_URL}`);
  }
  
  // Check NEXTAUTH_SECRET
  if (!envVars.NEXTAUTH_SECRET) {
    print('red', '❌ NEXTAUTH_SECRET is missing');
  } else if (envVars.NEXTAUTH_SECRET === 'your_nextauth_secret') {
    print('yellow', '⚠️ NEXTAUTH_SECRET is using a placeholder value');
  } else {
    print('green', '✅ NEXTAUTH_SECRET is set');
  }
  
  // Check GitHub credentials
  if (!envVars.GITHUB_CLIENT_ID) {
    print('red', '❌ GITHUB_CLIENT_ID is missing');
  } else {
    print('green', '✅ GITHUB_CLIENT_ID is set');
  }
  
  if (!envVars.GITHUB_CLIENT_SECRET) {
    print('red', '❌ GITHUB_CLIENT_SECRET is missing');
  } else {
    print('green', '✅ GITHUB_CLIENT_SECRET is set');
  }

  // Check callback URL
  const callbackUrl = `${envVars.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/github`;
  printHeader('GitHub Callback URL');
  print('cyan', `Make sure your GitHub OAuth app has this callback URL:`);
  print('white', callbackUrl);

  // Check required files
  printHeader('Required Files Check');
  
  const requiredFiles = [
    { path: 'app/api/auth/[...nextauth]/route.ts', name: 'NextAuth API Route' },
    { path: 'app/api/auth/utils/auth.ts', name: 'Auth Options' },
    { path: 'app/auth/error/page.tsx', name: 'Error Page' }
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.resolve(process.cwd(), file.path);
    if (fileExists(filePath)) {
      print('green', `✅ ${file.name} exists`);
    } else {
      print('red', `❌ ${file.name} is missing (${file.path})`);
      allFilesExist = false;
    }
  }

  // Summary
  printHeader('Summary');
  
  const missingEnvVars = Object.entries(envVars)
    .filter(([key, value]) => !value && ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'].includes(key))
    .map(([key]) => key);

  if (missingEnvVars.length === 0 && allFilesExist) {
    print('green', '✅ All required configuration appears to be in place');
    print('yellow', 'If you are still having issues, try running the fix-auth.js script:');
    print('white', 'node scripts/fix-auth.js');
  } else {
    print('red', '❌ There are issues with your auth configuration');
    print('yellow', 'Run the fix-auth.js script to resolve these issues:');
    print('white', 'node scripts/fix-auth.js');
  }
}

// Run the script
checkAuthConfig().catch(error => {
  console.error('Error:', error);
}); 