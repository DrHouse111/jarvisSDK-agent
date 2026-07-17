#!/bin/bash

# Jarvis Development Helper Script

command=$1

case $command in
    dev) npm run dev ;;
    build) npm run build ;;
    test) npm test ;;
    clean) rm -rf dist node_modules; npm install ;;
    setup) bash scripts/dev-setup.sh ;;
    check-google) npm run check:google ;;
    diagnostics) npm run diagnostics ;;
    *) echo "Usage: $0 {dev|build|test|clean|setup|check-google|diagnostics}" ;;
esac
