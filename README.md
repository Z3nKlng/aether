<![CDATA[# Aether

**AI-native autonomous engineering operating system.**

Build, deploy, and scale software from natural language. Describe what you want — Aether's multi-agent workforce designs the architecture, writes the code, runs the tests, manages infrastructure, and ships to production.

[![Status](https://img.shields.io/badge/status-production-ready-00AEFF?style=flat-square)]()
[![TypeScript](https://img.shields.io/badge/typescript-6.0-3178C6?style=flat-square&logo=typescript)]()
[![Next.js](https://img.shields.io/badge/next.js-15-black?style=flat-square&logo=next.js)]()
[![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)]()

---

## Overview

Aether combines the capabilities of Cursor, Devin, Linear, GitHub, Vercel, and Claude Code into a single browser-based platform. It replaces your entire engineering stack with a unified, autonomous workforce.

- **7 AI Agents** — Planner, Engineer, Reviewer, Tester, Security Analyst, DevOps, and a multi-agent Orchestrator that coordinates them all
- **Browser IDE** — Monaco editor with real-time collaboration, terminal emulator, file explorer, and ⌘+K command palette
- **One-Click Deploy** — Preview and production deployments with SSL, CDN, custom domains, and instant rollbacks
- **Sandboxed Execution** — Isolated Docker/Firecracker runtimes where agents code, debug, and test in security-hardened environments
- **Free Forever** — Unlimited projects, deployments, AI chats, and collaborators. We only charge for dedicated compute.

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │         Web Frontend (Next.js)       │
                    │  Landing · IDE · Dashboard · Auth   │
                    └──────────────┬──────────────────────┘
                                   │ GraphQL + WebSocket
                    ┌──────────────▼──────────────────────┐
                    │         API Gateway (GraphQL Yoga)   │
                    │  Auth · RBAC · Billing · Projects   │
                    └──────┬──────────────┬───────────────┘
                           │              │
              ┌────────────▼───┐   ┌──────▼──────────────┐
              │  AI Orchestrator │   │  Realtime Engine    │
              │  6 Agents + DAG  │   │  CRDT · Presence   │
              │  Model Router    │   │  Live Cursors      │
              └────────┬────────┘   └────────┬───────────┘
                       │                     │
              ┌────────▼────────┐   ┌────────▼───────────┐
              │  Sandbox Runtime │   │  PostgreSQL + Redis │
              │  Docker/gVisor   │   │  pgvector + Queue  │
              └─────────────────┘   └────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router, React 19, TypeScript, TailwindCSS, Framer Motion, Monaco Editor |
| Backend | GraphQL Yoga, Pothos, Prisma, Fastify, Socket.io, Hocuspocus (CRDT) |
| AI | Multi-agent DAG orchestrator, Model router (OpenAI/Anthropic/Gemini), pgvector |
| Infra | Docker, Kubernetes, Helm, Terraform (AWS), GitHub Actions, OpenTelemetry |

## Quick Start

```bash
# Clone and install
git clone https://github.com/aether/aether.git
cd aether
pnpm install

# Set up environment
cp .env.example .env

# Generate Prisma client
pnpm --filter @aether/database exec prisma generate

# Start development
pnpm turbo dev
```

### Services

| Service | Port | Description |
|---|---|---|
| Web | `:3000` | Next.js frontend (landing page, IDE, dashboard) |
| API | `:4000` | GraphQL API gateway (auth, projects, deployments) |
| Realtime | `:4001` | WebSocket server (collaboration, presence) |
| Deploy | `:4002` | Deployment engine (builds, previews, production) |

## Project Structure

```
apps/
├── web/              # Next.js frontend (landing, IDE, dashboard)
├── api/              # GraphQL API gateway
├── realtime/         # WebSocket + CRDT collaboration server
├── deploy/           # Deployment/build pipeline engine
└── agent-worker/     # Long-running agent task processor

packages/
├── agent-runtime/    # Multi-agent DAG orchestrator + 6 agent types
├── model-router/     # LLM provider router (OpenAI, Anthropic, Gemini)
├── context-engine/   # Codebase indexing + RAG pipeline
├── memory-system/    # Persistent vector memory (pgvector)
├── code-intelligence/# Repo analysis, AST parsing, refactoring
├── git-integration/  # GitHub/GitLab provider (clone, PR, commit, push)
├── auth/             # OAuth (4 providers), RBAC
├── billing/          # Stripe integration (metered usage)
├── database/         # Prisma schema + client
├── ui/               # Design system components
├── design-system/    # Design tokens (colors, spacing, typography)
├── redis/            # Redis client configuration
└── api-client/       # GraphQL client SDK

infra/
├── docker/           # Multi-stage production Dockerfiles
├── k8s/              # Kubernetes manifests (deployments, services)
├── helm/aether/      # Helm chart for full platform deploy
├── terraform/        # AWS infrastructure (VPC, EKS, RDS, Redis, CDN)
├── monitoring/       # OpenTelemetry, Prometheus, Grafana, Loki
├── sandbox/          # Secure Docker/Firecracker agent runtime
└── security/         # CSP headers, network policies
```

## Features

### 🤖 Autonomous AI Agents
- **Planner** — Decomposes goals into DAGs of executable tasks
- **Engineer** — Writes code, installs dependencies, runs builds
- **Reviewer** — Audits code for bugs, security, and style
- **Tester** — Generates and runs unit/integration/e2e tests
- **Security** — Scans for OWASP Top 10, hardens config
- **DevOps** — Writes Dockerfiles, CI/CD, Terraform, Helm charts

### 🎨 Browser IDE
- Monaco editor with custom Aether dark theme
- Multi-tab editing with file explorer sidebar
- Real-time terminal with command history
- ⌘+K universal command palette
- Live cursors and presence indicators
- AI sidecar chat panel

### 🌐 Global Deployments
- Preview URLs for every PR
- Production deploys with zero-downtime
- Custom domain support with automatic SSL
- Instant rollback to any previous version
- Live build logs via WebSocket

### 🔒 Security
- CSP headers configured
- Network policies (default-deny)
- Container sandbox isolation
- RBAC with 4 roles (OWNER, ADMIN, MEMBER, VIEWER)
- OAuth with 4 identity providers
- Stripe encryption for billing data

## Testing

```bash
# Run the full test suite
pnpm turbo test

# Run specific test suites
pnpm vitest run packages/model-router
pnpm vitest run apps/api
pnpm vitest run packages/auth

# E2E tests (requires Playwright)
npx playwright test apps/web/tests

# Load tests (requires k6)
k6 run infra/monitoring/load-tests/api.js
```

## Deployment

### Docker Compose (Local/Dev)
```bash
docker compose up -d
```

### Kubernetes (Production)
```bash
helm upgrade --install aether infra/helm/aether --values infra/helm/aether/values.yaml
```

### Terraform (Cloud Infrastructure)
```bash
cd infra/terraform
terraform init && terraform apply
```

See [docs/deployment.md](docs/deployment.md) for detailed instructions.

## Documentation

- [Architecture](docs/architecture.md) — System design and data flow
- [API Reference](docs/api.md) — GraphQL queries, mutations, subscriptions
- [Deployment Guide](docs/deployment.md) — Production deployment instructions
- [SDK Guide](docs/sdk.md) — Building custom agents and tools
- [Contributing](docs/contributing.md) — Development setup and guidelines
- [Security](SECURITY.md) — Vulnerability reporting and security policy

## License

MIT — see [LICENSE](./LICENSE) for details.

---

Built with ❄️ by the Aether team.
]]>