#!/usr/bin/env node

const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');

function runDiagnostics() {
  console.log('🔧 Jarvis System Diagnostics');
  console.log('=============================\n');

  // System Information
  console.log('📊 System Information:');
  console.log(`   Platform: ${os.platform()}`);
  console.log(`   Architecture: ${os.arch()}`);
  console.log(`   Total Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`);
  console.log(`   Free Memory: ${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`);
  console.log(`   CPU Cores: ${os.cpus().length}`);
  console.log(`   Uptime: ${Math.round(os.uptime() / 3600)} hours\n`);

  // Node.js Information
  console.log('📦 Node.js Environment:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   npm: ${execSync('npm --version').toString().trim()}`);
  console.log(`   CWD: ${process.cwd()}\n`);

  // Dependencies Check
  console.log('🔌 System Dependencies:');
  const deps = ['python3', 'gcc', 'make', 'ffmpeg', 'sox'];
  
  deps.forEach(dep => {
    try {
      execSync(`which ${dep}`, { stdio: 'ignore' });
      console.log(`   ✅ ${dep}`);
    } catch {
      console.log(`   ❌ ${dep}`);
    }
  });

  console.log('');

  // Audio Check
  if (os.platform() === 'linux') {
    console.log('🔊 Audio System:');
    try {
      const paOutput = execSync('pactl list short', { encoding: 'utf-8' });
      const sinks = paOutput.split('\n').filter(l => l.includes('sink'));
      const sources = paOutput.split('\n').filter(l => l.includes('source'));
      console.log(`   ✅ PulseAudio detected`);
      console.log(`   Sinks (speakers): ${sinks.length}`);
      console.log(`   Sources (microphones): ${sources.length}\n`);
    } catch {
      console.log('   ❌ PulseAudio not running');
      console.log('   Try: pulseaudio --start\n');
    }
  }

  // Environment Variables
  console.log('🔐 Environment Variables:');
  const envKeys = [
    'OPENAI_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_GENERATIVE_AI_ENABLED',
  ];
  
  envKeys.forEach(key => {
    const value = process.env[key];
    if (value) {
      const masked = value.length > 10 ? value.substring(0, 10) + '...' : value;
      console.log(`   ✅ ${key}: ${masked}`);
    } else {
      console.log(`   ⚠️  ${key}: not set`);
    }
  });

  console.log('\n✨ Diagnostics complete!');
}

runDiagnostics();
