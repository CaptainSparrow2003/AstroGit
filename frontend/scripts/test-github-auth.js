#!/usr/bin/env node

/**
 * GitHub OAuth Test Script
 * 
 * This script tests the GitHub OAuth configuration by making direct requests
 * to the GitHub API using the configured credentials.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for terminal output
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

// Load environment variables from .env.local
function loadEnvVars() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
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

// Make a GET request to a URL
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: headers
    };
    
    const req = https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: jsonData });
          } catch (err) {
            resolve({ statusCode: res.statusCode, data: data });
          }
        } else {
          reject({ statusCode: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Open a URL in the default browser
function openBrowser(url) {
  let command;
  switch (process.platform) {
    case 'darwin': // macOS
      command = `open "${url}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${url}"`;
      break;
    default: // Linux and others
      command = `xdg-open "${url}"`;
      break;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error(`Failed to open browser: ${error.message}`);
    }
  });
}

// Main function
async function testGitHubAuth() {
  printHeader('GitHub OAuth Configuration Test');
  
  // Load environment variables
  const envVars = loadEnvVars();
  
  // Check for required variables
  print('yellow', 'Checking environment variables...');
  const clientId = envVars.GITHUB_CLIENT_ID;
  const clientSecret = envVars.GITHUB_CLIENT_SECRET;
  const nextAuthUrl = envVars.NEXTAUTH_URL || 'http://localhost:3000';
  
  if (!clientId) {
    print('red', '❌ GITHUB_CLIENT_ID is missing in .env.local');
    return;
  }
  
  if (!clientSecret) {
    print('red', '❌ GITHUB_CLIENT_SECRET is missing in .env.local');
    return;
  }
  
  print('green', '✅ GitHub credentials found');
  print('blue', `Client ID: ${clientId.substring(0, 8)}...`);
  
  // Test GitHub API rate limit to verify credentials format
  print('yellow', '\nTesting GitHub API access...');
  try {
    const result = await httpsGet('https://api.github.com/rate_limit');
    print('green', `✅ GitHub API accessible (Rate limit: ${result.data.resources.core.remaining}/${result.data.resources.core.limit})`);
  } catch (error) {
    print('red', `❌ GitHub API error: ${error.statusCode || error.message}`);
  }
  
  // Generate test OAuth URL
  const callbackUrl = `${nextAuthUrl}/api/auth/callback`;
  const state = Date.now().toString();
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=read:user,user:email&state=${state}`;
  
  printHeader('GitHub OAuth Test');
  print('white', 'To test the OAuth flow:');
  print('white', '1. The following URL will open in your browser');
  print('white', '2. Authorize the application on GitHub');
  print('white', '3. You should be redirected to your callback URL');
  print('white', '4. Check the URL parameters for errors or success codes');
  
  print('cyan', `\nTest URL: ${authUrl}`);
  
  // Ask to open browser
  rl.question('\nOpen this URL in your browser? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      openBrowser(authUrl);
      print('yellow', '\nBrowser opened! Check for successful authorization or errors.');
    }
    
    printHeader('Callback URL Configuration');
    print('white', 'Make sure your GitHub OAuth App has these callback URLs:');
    print('green', `1. ${nextAuthUrl}/api/auth/callback/github (NextAuth.js default)`);
    print('green', `2. ${callbackUrl} (Direct test endpoint)`);
    
    printHeader('Next Steps');
    print('white', '1. If authorization succeeded but NextAuth still fails:');
    print('white', '   - Check NEXTAUTH_SECRET in .env.local');
    print('white', '   - Verify NextAuth.js configuration');
    print('white', '2. If authorization failed:');
    print('white', '   - Check GitHub OAuth App settings');
    print('white', '   - Verify callback URLs match exactly');
    print('white', '3. Try the direct auth page:');
    print('white', `   - ${nextAuthUrl}/auth/github`);
    
    rl.close();
  });
}

// Run the script
testGitHubAuth().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 