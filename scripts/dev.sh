#!/usr/bin/env bash
set -euo pipefail

echo "=== Aether Development Mode ==="

# Start infrastructure services (PostgreSQL, Redis) if Docker is available
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  echo "Starting infrastructure services..."
  docker compose up -d db redis 2>/dev/null || true
fi

# Run turbo dev (starts all apps with hot reload)
echo "Starting all services in dev mode..."
pnpm turbo dev --parallel