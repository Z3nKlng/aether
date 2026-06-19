#!/usr/bin/env bash
set -euo pipefail

echo "=== Aether Development Setup ==="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required but not installed. Install it via: npm install -g pnpm"; exit 1; }

echo "Node.js: $(node --version)"
echo "pnpm: $(pnpm --version)"

# Create .env from .env.example if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "WARNING: Update .env with your actual secrets before running in production mode."
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
pnpm --filter @aether/database exec prisma generate

echo "=== Setup Complete ==="
echo ""
echo "To start development:  ./scripts/dev.sh"
echo "To run tests:         ./scripts/test.sh"
echo "To build:             pnpm turbo build"