#!/usr/bin/env node

// Script to generate a secure NEXTAUTH_SECRET for NextAuth.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a secure random string
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

// Check if .env.local exists and update it
function updateEnvFile(secret) {
  const envPath = path.resolve(process.cwd(), '.env.local');
  
  try {
    let envContent = '';
    let secretUpdated = false;
    
    // Read existing .env.local if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if NEXTAUTH_SECRET already exists
      const lines = envContent.split('\n');
      const updatedLines = lines.map(line => {
        if (line.startsWith('NEXTAUTH_SECRET=')) {
          secretUpdated = true;
          return `NEXTAUTH_SECRET=${secret}`;
        }
        return line;
      });
      
      if (secretUpdated) {
        envContent = updatedLines.join('\n');
      } else {
        // Add to the end if not found
        envContent = envContent.trim() + `\nNEXTAUTH_SECRET=${secret}\n`;
      }
    } else {
      // Create new .env.local with the secret
      envContent = `NEXTAUTH_SECRET=${secret}\n`;
    }
    
    // Write back to file
    fs.writeFileSync(envPath, envContent);
    
    console.log(`✅ NEXTAUTH_SECRET has been ${secretUpdated ? 'updated' : 'added'} in .env.local`);
  } catch (error) {
    console.error('Error updating .env.local file:', error.message);
    console.log('\nPlease manually add the following to your .env.local file:');
    console.log(`NEXTAUTH_SECRET=${secret}`);
  }
}

// Main execution
console.log('Generating secure NEXTAUTH_SECRET for AstroGit...\n');

const secret = generateSecret();
console.log('Generated secret:', secret);

// Ask if user wants to update .env.local
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('\nDo you want to update .env.local with this secret? (y/n) ', answer => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    updateEnvFile(secret);
  } else {
    console.log('\nPlease manually add the following to your .env.local file:');
    console.log(`NEXTAUTH_SECRET=${secret}`);
  }
  
  console.log('\nRemember to restart your Next.js server after updating environment variables.');
  readline.close();
}); 