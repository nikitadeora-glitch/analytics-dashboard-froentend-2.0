#!/usr/bin/env node

// Build script for production deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building for production...');

// Ensure .env.production exists
const envProdPath = path.join(__dirname, '.env.production');
if (!fs.existsSync(envProdPath)) {
  console.error('❌ .env.production file not found!');
  console.log('Creating .env.production with default values...');
  
  const envContent = `VITE_API_URL=https://api.seo.prpwebs.com/api

VITE_GOOGLE_CLIENT_ID=276575813186-e1q7equvp7nq222q5sbal2f7aaensau3.apps.googleusercontent.com`;
  
  fs.writeFileSync(envProdPath, envContent);
  console.log('✅ Created .env.production');
}

try {
  // Build with production mode
  console.log('📦 Running build command...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Production build completed successfully!');
  console.log('📁 Files are ready in the dist/ folder');
  console.log('🌐 Deploy the dist/ folder to your web server');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}