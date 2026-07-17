#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

const UBUNTU_PACKAGES = [
  'pulseaudio',
  'alsa-utils',
  'sox',
  'ffmpeg',
  'build-essential',
  'python3-dev',
];

async function setupLinux() {
  console.log('🐧 Jarvis Linux/Ubuntu Setup');
  console.log('==============================\n');

  try {
    // Check if running on Linux
    const platform = require('os').platform();
    if (platform !== 'linux') {
      console.error('❌ This script is for Linux/Ubuntu only');
      process.exit(1);
    }

    console.log('📦 Installing system dependencies...');
    const pkgList = UBUNTU_PACKAGES.join(' ');
    console.log(`   Command: sudo apt install ${pkgList}`);
    console.log('   Note: You may be prompted for your password\n');

    try {
      await execAsync(`sudo apt install -y ${pkgList}`);
      console.log('✅ System dependencies installed\n');
    } catch (error) {
      console.warn('⚠️  Some packages may not have installed. Please run manually:\n');
      console.warn(`    sudo apt install -y ${pkgList}\n`);
    }

    // Add user to audio group
    console.log('🔊 Setting up audio permissions...');
    try {
      await execAsync('sudo usermod -aG audio $USER');
      console.log('✅ User added to audio group');
      console.log('   Note: You may need to log out and back in for changes to take effect\n');
    } catch (error) {
      console.warn('⚠️  Could not add user to audio group. Run manually:');
      console.warn('    sudo usermod -aG audio $USER\n');
    }

    // Check Node.js version
    console.log('⚙️  Checking Node.js version...');
    const { stdout: nodeVersion } = await execAsync('node --version');
    const version = parseInt(nodeVersion.match(/\d+/)[0]);
    
    if (version >= 18) {
      console.log(`✅ Node.js ${nodeVersion.trim()} (minimum: 18.0.0)\n`);
    } else {
      console.error(`❌ Node.js ${nodeVersion.trim()} is too old. Minimum: 18.0.0`);
      process.exit(1);
    }

    console.log('📝 Creating configuration files...');
    const envPath = path.join(process.cwd(), '.env.local');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    try {
      await fs.access(envPath);
      console.log('   .env.local already exists');
    } catch {
      console.log('   Copying .env.example to .env.local');
      const example = await fs.readFile(envExamplePath, 'utf8');
      await fs.writeFile(envPath, example);
      console.log('✅ .env.local created. Edit it with your API keys');
    }

    console.log('\n✨ Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Edit .env.local with your Google Cloud credentials');
    console.log('2. Run: npm install');
    console.log('3. Run: npm run dev');
    console.log('\n📚 Documentation: See README.md for detailed setup instructions');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupLinux().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
