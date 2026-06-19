#!/usr/bin/env bash
set -euo pipefail

echo "=== Aether Test Suite ==="

# Generate Prisma client if needed
pnpm --filter @aether/database exec prisma generate 2>/dev/null || true

# Run type checks first
echo "Running type checks..."
pnpm turbo typecheck || echo "Type check warnings found (continuing)..."

# Run lint
echo "Running lint..."
pnpm turbo lint || echo "Lint warnings found (continuing)..."

# Run tests
echo "Running tests..."
pnpm turbo test

echo "=== All tests complete ==="