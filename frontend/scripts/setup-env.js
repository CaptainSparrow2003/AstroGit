#!/usr/bin/env node

// Setup script to create .env.local file for AstroGit
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

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

// Main setup function
async function setupEnv() {
  console.log('\n🔮 AstroGit Environment Setup 🔮\n');
  console.log('This script will help you create a .env.local file for your frontend.\n');
  
  const envPath = path.resolve(process.cwd(), '.env.local');
  let existingEnv = {};
  
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('An existing .env.local file was found.');
    const overwrite = await askQuestion('Do you want to update it? (y/n)', 'y');
    
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('\nSetup cancelled. Your existing .env.local file was not modified.');
      rl.close();
      return;
    }
    
    // Read existing values to use as defaults
    const envContent = fs.readFileSync(envPath, 'utf8');
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
  }
  
  console.log('\n📝 Please provide the following information:\n');
  
  // Collect environment variables
  const envVars = {
    NEXTAUTH_URL: await askQuestion('NextAuth URL', existingEnv.NEXTAUTH_URL || 'http://localhost:3000'),
    NEXTAUTH_SECRET: existingEnv.NEXTAUTH_SECRET || generateSecret(),
    GITHUB_CLIENT_ID: await askQuestion('GitHub Client ID', existingEnv.GITHUB_CLIENT_ID || ''),
    GITHUB_CLIENT_SECRET: await askQuestion('GitHub Client Secret', existingEnv.GITHUB_CLIENT_SECRET || ''),
    NEXT_PUBLIC_API_URL: await askQuestion('API URL', existingEnv.NEXT_PUBLIC_API_URL || 'http://localhost:3001'),
    NEXT_PUBLIC_SUPABASE_URL: await askQuestion('Supabase URL', existingEnv.NEXT_PUBLIC_SUPABASE_URL || ''),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: await askQuestion('Supabase Anon Key', existingEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  };
  
  // Generate .env.local content
  let envContent = '';
  for (const [key, value] of Object.entries(envVars)) {
    envContent += `${key}=${value}\n`;
  }
  
  // Write to file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`\n✅ Success! .env.local file has been ${fs.existsSync(envPath) ? 'updated' : 'created'}.`);
    console.log(`📁 File location: ${envPath}`);
  } catch (error) {
    console.error('\n❌ Error writing .env.local file:', error.message);
    console.log('\nHere is the content you should manually add to your .env.local file:');
    console.log('\n' + envContent);
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Make sure your GitHub OAuth app is configured with this callback URL:');
  console.log(`   ${envVars.NEXTAUTH_URL}/api/auth/callback/github`);
  console.log('2. Restart your Next.js server with: npm run dev');
  console.log('3. Test your authentication by signing in with GitHub');
  
  rl.close();
}

// Run setup
setupEnv().catch(error => {
  console.error('Setup failed:', error);
  rl.close();
}); 