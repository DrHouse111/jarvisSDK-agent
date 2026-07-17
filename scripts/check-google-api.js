#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

async function checkGoogleAPI() {
  console.log('🔍 Google API Configuration Check');
  console.log('==================================\n');

  const checks = {
    projectId: { key: 'GOOGLE_CLOUD_PROJECT_ID', required: true },
    apiKey: { key: 'GOOGLE_API_KEY', required: false },
    credentials: { key: 'GOOGLE_APPLICATION_CREDENTIALS', required: false },
    speechToText: { key: 'GOOGLE_SPEECH_TO_TEXT_ENABLED', required: false },
    textToSpeech: { key: 'GOOGLE_TEXT_TO_SPEECH_ENABLED', required: false },
    generativeAI: { key: 'GOOGLE_GENERATIVE_AI_ENABLED', required: false },
  };

  let allOk = true;
  let hasAuth = false;

  for (const [name, config] of Object.entries(checks)) {
    const value = process.env[config.key];
    const status = value ? '✅' : '❌';
    const required = config.required ? ' (required)' : '';
    
    console.log(`${status} ${config.key}${required}`);
    
    if (value) {
      if (config.key === 'GOOGLE_APPLICATION_CREDENTIALS') {
        console.log(`   → ${value}`);
        hasAuth = true;
      } else if (config.key === 'GOOGLE_API_KEY') {
        console.log(`   → ${value.substring(0, 10)}...`);
        hasAuth = true;
      } else if (config.key === 'GOOGLE_CLOUD_PROJECT_ID') {
        console.log(`   → ${value}`);
      }
    } else if (config.required) {
      allOk = false;
    }
  }

  console.log('\n📋 Summary:');
  if (!hasAuth) {
    console.log('⚠️  No authentication method configured');
    console.log('   Set either GOOGLE_API_KEY or GOOGLE_APPLICATION_CREDENTIALS');
    allOk = false;
  } else {
    console.log('✅ Authentication method configured');
  }

  if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
    console.log('✅ Project ID configured');
  } else {
    console.log('⚠️  Project ID not configured');
    allOk = false;
  }

  if (allOk) {
    console.log('\n✨ All required settings configured!');
  } else {
    console.log('\n📖 Setup instructions:');
    console.log('1. Go to https://console.cloud.google.com');
    console.log('2. Create a new project or select existing');
    console.log('3. Enable required APIs (Speech-to-Text, Text-to-Speech, Generative AI)');
    console.log('4. Create API key or service account credentials');
    console.log('5. Add credentials to .env.local');
  }
}

checkGoogleAPI().catch(console.error);
