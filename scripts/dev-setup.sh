#!/bin/bash

# Jarvis Development Environment Setup Script for Ubuntu/Linux
# This script sets up a complete development environment with all tools

set -e

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "   Jarvis Development Environment Setup for Ubuntu/Linux"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}✗ This script is for Linux/Ubuntu only${NC}"
    exit 1
fi

echo -e "${BLUE}📋 System Information:${NC}"
echo "  OS: $(lsb_release -ds 2>/dev/null || echo 'Unknown')"
echo "  Kernel: $(uname -r)"
echo "  Architecture: $(uname -m)"
echo ""

print_section() {
    echo ""
    echo -e "${BLUE}────────────────────────────────────────────────────────────────────────${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}────────────────────────────────────────────────────────────────────────${NC}"
fi

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

install_package() {
    echo -e "${YELLOW}→${NC} Installing $1..."
    sudo apt install -y "$1" >/dev/null 2>&1
    echo -e "${GREEN}✓${NC} $1 installed"
}

print_section "🔄 Updating System Packages"
sudo apt update >/dev/null 2>&1
sudo apt upgrade -y >/dev/null 2>&1
echo -e "${GREEN}✓${NC} System packages updated"

print_section "🛠️  Installing Build Tools"

for tool in build-essential git curl wget vim nano htop net-tools jq pkg-config python3 python3-dev python3-pip; do
    if ! command_exists "${tool%%-*}"; then
        install_package "$tool"
    else
        echo -e "${GREEN}✓${NC} $tool already installed"
    fi
done

print_section "📦 Setting Up Node.js Environment"

if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - >/dev/null 2>&1
    sudo apt install -y nodejs >/dev/null 2>&1
    echo -e "${GREEN}✓${NC} Node.js installed"
else
    echo -e "${GREEN}✓${NC} Node.js $(node -v) already installed"
fi

echo "npm: $(npm -v)"

print_section "🔊 Installing Audio Development Tools"

for tool in pulseaudio pulseaudio-utils alsa-base alsa-utils sox libsox-dev ffmpeg; do
    if ! command_exists "${tool%%-*}"; then
        install_package "$tool"
    else
        echo -e "${GREEN}✓${NC} $tool already installed"
    fi
done

pulseaudio --start >/dev/null 2>&1 || true
echo -e "${GREEN}✓${NC} PulseAudio configured"

print_section "🔐 Setting Up User Permissions"

if ! groups "$USER" | grep -q "audio"; then
    sudo usermod -aG audio "$USER"
    echo -e "${YELLOW}⚠${NC}  Log out and back in for changes to take effect"
else
    echo -e "${GREEN}✓${NC} User already in audio group"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run dev"
echo ""
echo -e "${BLUE}Happy Coding! 🚀${NC}"
