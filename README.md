# Jarvis - Personal AI Assistant

A powerful desktop AI assistant with **Google Cloud integration** optimized for **Linux/Ubuntu** systems. Built with Electron, React, and real-time voice capabilities powered by OpenAI and Google APIs.

![Jarvis Assistant](https://img.shields.io/badge/Jarvis-AI%20Assistant-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Linux%2FUbuntu-orange?style=flat-square)
![Node.js](https://img.shields.io/badge/node.js-%3E%3D18.0.0-green?style=flat-square)

## 🌟 Features

### Core Capabilities
- **Real-time Voice Conversation** - Speech-to-Text and Text-to-Speech with Google Cloud APIs
- **AI-Powered Responses** - Intelligent responses using Google Gemini AI
- **Animated Assistant Interface** - Listening, thinking, speaking, and working states
- **Artifact Panel** - Display markdown, code, charts, images, and visual content
- **Local Data Storage** - Notes, records, and settings stored securely locally
- **System Integration** - Direct system access and diagnostics on Linux/Ubuntu

### Google Cloud Integration
- ✅ **Google Speech-to-Text** - Advanced speech recognition with automatic punctuation
- ✅ **Google Text-to-Speech** - Natural-sounding voice synthesis with multiple voices
- ✅ **Google Generative AI (Gemini)** - State-of-the-art language model for intelligent responses
- ✅ **Multi-language Support** - 100+ languages supported

### Linux/Ubuntu Optimization
- 🐧 **Native Linux Support** - Optimized for Ubuntu 20.04+
- 🔊 **PulseAudio Integration** - Full audio system support
- 📊 **System Diagnostics** - Real-time system information and performance monitoring
- ⚙️ **Dependency Management** - Automatic system package checking
- 🔐 **Secure Configuration** - Safe credential management and environment variables

## 📋 System Requirements

### Minimum
- **OS**: Ubuntu 20.04 LTS or newer (Linux-based distributions)
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Audio System
- PulseAudio or ALSA configured
- Microphone and speakers
- User permissions for audio group

### Google Cloud APIs
- Valid Google Cloud Project
- Google Cloud APIs enabled:
  - Cloud Speech-to-Text API
  - Cloud Text-to-Speech API
  - Google AI (Gemini) API

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/DrHouse111/jarvisSDK-agent.git
cd jarvisSDK-agent
```

### 2. Switch to Google Integration Branch
```bash
git checkout google-integration-ubuntu
```

### 3. Install System Dependencies (Ubuntu/Debian)
```bash
npm run setup:linux
```

This will automatically install:
- PulseAudio and ALSA utilities
- FFmpeg and SoX for audio processing
- Build tools for native modules
- Set up audio group permissions

### 4. Configure Environment Variables
```bash
cp .env.example .env.local
nano .env.local
```

Edit `.env.local` with your API keys:

```bash
# OpenAI API (for realtime voice)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxx

# Optional: Service account credentials
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Enable Google APIs
GOOGLE_SPEECH_TO_TEXT_ENABLED=true
GOOGLE_TEXT_TO_SPEECH_ENABLED=true
GOOGLE_GENERATIVE_AI_ENABLED=true
GOOGLE_GENERATIVE_AI_MODEL=gemini-1.5-pro

# Assistant Configuration
ASSISTANT_NAME=Jarvis
ASSISTANT_VOICE=en-US-Neural2-C
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Verify Configuration
```bash
npm run check:google
npm run diagnostics
```

### 7. Start Development
```bash
npm run dev
```

The application will start on `127.0.0.1:5173` and launch Electron.

## 🔐 Google Cloud Setup Guide

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Enter project name and click "Create"

### Step 2: Enable Required APIs
1. Navigate to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Cloud Speech-to-Text API**
   - **Cloud Text-to-Speech API**
   - **Google AI (Gemini) API**

### Step 3: Create Credentials

#### Option A: API Key (Recommended for Development)
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Add to `.env.local`:
   ```bash
   GOOGLE_API_KEY=your_api_key_here
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   ```

#### Option B: Service Account (Recommended for Production)
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in service account details
4. Create a key (JSON format)
5. Download the key file
6. Add to `.env.local`:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   ```

### Step 4: Set up Billing (Required for API calls)
1. Go to "Billing" in Google Cloud Console
2. Enable billing for your project
3. APIs will work immediately with free tier limits

## 📚 Available Commands

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run typecheck    # Check TypeScript types
npm start            # Run built application
```

### Linux Setup
```bash
npm run setup:linux      # Install system dependencies (Ubuntu/Debian)
npm run check:google     # Verify Google API configuration
npm run diagnostics      # Run system diagnostics
```

## 🏗️ Project Structure

```
jarvisSDK-agent/
├── electron/
│   ├── main-ubuntu.cjs           # Ubuntu-optimized main process
│   ├── google-api-client.cjs      # Google Cloud API wrapper
│   ├── linux-system-utils.cjs     # Linux system utilities
│   ├── preload.cjs                # Preload script
│   └── main.cjs                   # Original main process (macOS)
├── src/
│   ├── App.tsx                    # Main React component
│   ├── main.tsx                   # React entry point
│   ├── styles.css                 # Application styles
│   ├── components/                # React components
│   └── lib/                       # Utility functions
├── scripts/
│   ├── setup-linux.js             # Linux setup script
│   ├── check-google-api.js        # Google API checker
│   └── system-diagnostics.js      # System diagnostics
├── package.json                   # Project dependencies
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## 🔧 Configuration Details

### Google APIs Configuration

#### Speech-to-Text
```javascript
{
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: 'en-US',
  enableAutomaticPunctuation: true,
  model: 'latest_long'
}
```

#### Text-to-Speech
```javascript
{
  languageCode: 'en-US',
  voice: 'en-US-Neural2-C',
  audioEncoding: 'LINEAR16',
  sampleRateHertz: 16000
}
```

Supported voices: `en-US-Neural2-A`, `en-US-Neural2-B`, `en-US-Neural2-C`, `en-US-Neural2-D`, `en-US-Neural2-E`

#### Generative AI (Gemini)
```javascript
{
  model: 'gemini-1.5-pro',
  temperature: 0.7,
  topP: 0.95,
  topK: 40
}
```

## 🐛 Troubleshooting

### Audio Issues
**Problem**: No microphone input or speaker output
```bash
# Check PulseAudio status
pulseaudio --check
pulseaudio --start

# List audio devices
pactl list short

# Test microphone
arecord -f cd /tmp/test.wav

# Test speaker
paplay /tmp/test.wav
```

**Problem**: User not in audio group
```bash
# Add user to audio group
sudo usermod -aG audio $USER

# Apply changes (log out and back in, or use):
newgrp audio
```

### Google API Issues
**Problem**: API Key not working
```bash
# Verify configuration
npm run check:google

# Check credentials file exists
ls -la $GOOGLE_APPLICATION_CREDENTIALS
```

**Problem**: Speech recognition not working
1. Verify `GOOGLE_SPEECH_TO_TEXT_ENABLED=true` in `.env.local`
2. Check microphone is working: `arecord -f cd test.wav`
3. Verify API is enabled in Google Cloud Console

### Build Issues
**Problem**: Missing dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Problem**: TypeScript errors
```bash
npm run typecheck
```

## 📖 Using Jarvis

### Voice Control
1. Click the microphone button to connect
2. Speak naturally - Jarvis will listen and respond
3. Click to disconnect voice mode

### Text Input
1. Click the keyboard button to enable text mode
2. Type your message
3. Press Enter to send

### System Commands
- **"Show system diagnostics"** - Display system information
- **"Check dependencies"** - Verify installed packages
- **"Google setup status"** - Check API configuration

### Managing Notes and Records
1. Create notes with Jarvis
2. View and edit in the artifact panel
3. All data stored locally in `data/` directory

## 🔒 Security Considerations

- ✅ API keys stored only in local `.env.local` file
- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ All sensitive data remains on your machine
- ✅ No telemetry or tracking
- ✅ Secure credential file handling
- ✅ Context isolation in Electron

**Never commit `.env.local` to version control!**

## 📊 System Permissions

### Required Permissions
- **Microphone**: Needed for speech input
- **Audio Output**: For text-to-speech playback
- **File System**: For local data storage
- **Network**: For Google Cloud API calls

### Granting Permissions
Most permissions are handled automatically. For audio:
```bash
sudo usermod -aG audio $USER
newgrp audio
```

## 🚀 Performance Optimization

### Memory Usage
- Typical: 200-400MB
- With active audio: 300-500MB
- Monitor with: `npm run diagnostics`

### CPU Usage
- Idle: <5%
- Processing audio: 10-20%
- Generating text: 15-30%

### Recommendations
- Use SSD for better performance
- 8GB RAM for smooth operation
- Close other applications for best results

## 📱 Supported Systems

| OS | Version | Status |
|---|---|---|
| Ubuntu | 20.04 LTS+ | ✅ Tested |
| Debian | 11+ | ✅ Supported |
| Fedora | 36+ | ✅ Supported |
| Arch Linux | Latest | ✅ Supported |
| Linux Mint | 20+ | ✅ Supported |

## 🔄 Updating

```bash
# Update to latest version
git fetch origin
git checkout google-integration-ubuntu
git pull origin google-integration-ubuntu

# Reinstall dependencies
npm install

# Verify setup
npm run check:google
npm run diagnostics
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits & Acknowledgments

### Original Creator
**Riley Brown** - Original Jarvis SDK and RileyJarvis project
- Repository: [github.com/rileybrown/rileyjarvis](https://github.com/rileybrown/rileyjarvis)
- Original concept and design

### Google Cloud Integration & Linux Optimization
**DrHouse111** - Google Cloud APIs integration, Ubuntu/Linux optimization
- Repository: [github.com/DrHouse111/jarvisSDK-agent](https://github.com/DrHouse111/jarvisSDK-agent)
- Google Cloud SDK implementation
- Linux/Ubuntu system utilities
- Enhanced documentation and setup guides

### Key Technologies
- **Electron** - Cross-platform desktop application framework
- **React** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next generation build tool
- **Google Cloud APIs** - Speech, Text-to-Speech, and Generative AI
- **OpenAI Realtime API** - Voice conversation
- **Node.js** - JavaScript runtime

### Dependencies
- `@google-cloud/speech` - Google Cloud Speech-to-Text
- `@google-cloud/text-to-speech` - Google Cloud Text-to-Speech
- `@google/generative-ai` - Google Generative AI (Gemini)
- `dotenv` - Environment variable management
- `lucide-react` - Icon library
- `mermaid` - Diagram rendering

## 🌐 Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 💬 Support

For issues and questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Run diagnostic: `npm run diagnostics`
3. Open an issue on GitHub with diagnostic output

## 🎯 Roadmap

- [ ] Windows/macOS support
- [ ] Additional voice options
- [ ] Advanced scheduling features
- [ ] Custom LLM model support
- [ ] Enhanced UI themes
- [ ] Plugin system
- [ ] Docker container support

## ⚖️ Legal

This project is not officially affiliated with Google or OpenAI. All trademarks are property of their respective owners.

---

**Made with ❤️ for Linux/Ubuntu systems**

Last Updated: July 17, 2026
Version: 2.0.0
