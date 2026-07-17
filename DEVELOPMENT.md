# Jarvis Development Guide for Ubuntu/Linux

Complete guide for developing Jarvis on Linux/Ubuntu systems.

## Quick Start

```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
npm install
npm run dev
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Run diagnostics
npm run diagnostics

# Check Google API
npm run check:google
```

## IDE Setup

### VSCode
1. Install recommended extensions:
   - TypeScript Support
   - ESLint
   - Prettier
   - GitHub Copilot

2. VSCode settings are auto-configured via `.vscode/settings.json`

### VIM/Neovim
Install vim-plug and configure TypeScript support:
```bash
curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

## Debugging

```bash
# Debug with logging
DEBUG=* npm run dev

# Open DevTools in Electron
# Keyboard: Ctrl+Shift+I
```

## Audio Development

```bash
# Test microphone
arecord -f cd -d 5 test.wav
paplay test.wav

# Check audio devices
pactl list short

# Verify permissions
groups $USER
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

## Troubleshooting

### Audio not working
```bash
pulseaudio --start
groups $USER  # Should include 'audio'
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Google API issues
```bash
npm run check:google
```

For more details, see full DEVELOPMENT.md file.
