# Contributing to Aether

We welcome contributions from the community!

## Development Setup

1. Fork the repository.
2. Install dependencies: `pnpm install`.
3. Set up local environment variables: `cp .env.example .env`.
4. Start the dev stack: `docker-compose up -d`.
5. Run the dev server: `pnpm dev`.

## Project Structure

- `apps/`: Main applications (web, api, realtime).
- `packages/`: Shared packages (database, auth, model-router, ui).
- `infra/`: Infrastructure as Code (Terraform, K8s, Docker).
- `docs/`: Documentation.

## Pull Request Process

1. Create a new branch for your feature or bugfix.
2. Ensure all tests pass: `pnpm test`.
3. Ensure the code is linted: `pnpm lint`.
4. Open a PR with a clear description of the changes.
5. Wait for review from the core team.

## Coding Standards

- Use TypeScript for all new code.
- Follow the Prettier and ESLint configurations.
- Write unit tests for all new packages and services.

## Community

- Discord: [Join our server](https://discord.gg/aether)
- Twitter: [@aether_os](https://twitter.com/aether_os)
