#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up App Feedback Analysis Tool...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created. Please edit it with your OpenAI API key.');
  } else {
    console.log('❌ env.example file not found. Please create a .env file manually.');
  }
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed.');
} catch (error) {
  console.log('❌ Failed to install backend dependencies.');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed.');
} catch (error) {
  console.log('❌ Failed to install frontend dependencies.');
  process.exit(1);
}

// Create data directory
console.log('\n📁 Creating data directory...');
try {
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }
  console.log('✅ Data directory created.');
} catch (error) {
  console.log('❌ Failed to create data directory.');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file and add your OpenAI API key');
console.log('2. Run "npm run dev" to start the backend server');
console.log('3. Run "npm run client" to start the frontend (in a new terminal)');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📚 For more information, see README.md'); 